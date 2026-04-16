import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import { getEnv } from "@/lib/env";

export type JwtPayload = {
  sub: string;
  role: Role;
  email: string;
};

const getSecret = () => new TextEncoder().encode(getEnv().JWT_SECRET);
const getIssuer = () => getEnv().JWT_ISSUER ?? "dossierloc";
const getAudience = () => getEnv().JWT_AUDIENCE ?? "dossierloc-users";

export async function signToken(payload: JwtPayload, expiresIn = "7d"): Promise<string> {
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(getIssuer())
    .setAudience(getAudience())
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: getIssuer(),
      audience: getAudience(),
      algorithms: ["HS256"],
    });
    const sub = payload.sub;
    const role = payload.role as Role | undefined;
    const email = payload.email as string | undefined;
    if (!sub || !role || !email) return null;
    return { sub, role, email };
  } catch {
    return null;
  }
}
