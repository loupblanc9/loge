import { NextResponse } from "next/server";

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleRouteError(e: unknown) {
  if (e instanceof Error) {
    if (e.message === "UNAUTHORIZED" && "status" in e && (e as { status: number }).status === 401) {
      return jsonError("Non authentifié", 401);
    }
    if (e.message === "FORBIDDEN" && "status" in e && (e as { status: number }).status === 403) {
      return jsonError("Accès refusé", 403);
    }
  }
  console.error(e);
  return jsonError("Erreur serveur", 500);
}
