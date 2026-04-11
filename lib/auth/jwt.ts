import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import { getEnv } from "@/lib/env";

export type JwtPayload = {
  sub: string;
  role: Role;
  email: string;
};

const getSecret = () => new TextEncoder().encode(getEnv().JWT_SECRET);

export async function signToken(payload: JwtPayload, expiresIn = "7d"): Promise<string> {
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const role = payload.role as Role | undefined;
    const email = payload.email as string | undefined;
    if (!sub || !role || !email) return null;
    return { sub, role, email };
  } catch {
    return null;
  }
}
