import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { jsonError, handleRouteError } from "@/lib/api/errors";
import { getClientIp } from "@/lib/security/request-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`register:${ip}`, 5, 60_000);
    if (!rate.ok) {
      return jsonError("Trop de créations de compte, réessayez dans un instant", 429, {
        retryAfterSec: rate.retryAfterSec,
      });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError("Données invalides", 400, { details: parsed.error.flatten() });
    }
    const { email, password, name, phone: phoneRaw } = parsed.data;
    const phone =
      phoneRaw != null && String(phoneRaw).trim() !== "" ? String(phoneRaw).trim().slice(0, 40) : null;

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) {
      return jsonError("Cet email est déjà utilisé", 409);
    }

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: await hashPassword(password),
        name,
        phone,
        role: "client",
      },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, phone: true },
    });

    const token = await signToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });
    await setAuthCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
