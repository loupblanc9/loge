import type { Role, User } from "@prisma/client";
import { verifyToken } from "@/lib/auth/jwt";
import { getAuthCookie } from "@/lib/auth/cookies";
import { prisma } from "@/lib/prisma";

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "avatarUrl">;

export async function getSession(): Promise<SessionUser | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true },
  });
  return user;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    const err = new Error("UNAUTHORIZED") as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    const err = new Error("FORBIDDEN") as Error & { status: number };
    err.status = 403;
    throw err;
  }
  return user;
}

export function isAdmin(role: Role): boolean {
  return role === "admin";
}
