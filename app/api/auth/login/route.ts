import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { jsonError, handleRouteError } from "@/lib/api/errors";
import { getClientIp } from "@/lib/security/request-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!rate.ok) {
      return jsonError("Trop de tentatives, réessayez dans un instant", 429, {
        retryAfterSec: rate.retryAfterSec,
      });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError("Données invalides", 400);
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return jsonError("Identifiants incorrects", 401);
    }

    const token = await signToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        phone: user.phone ?? null,
      },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
