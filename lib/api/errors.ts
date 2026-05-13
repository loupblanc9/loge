import { NextResponse } from "next/server";

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

function isConfigurationError(e: unknown): e is Error {
  return e instanceof Error && e.message.startsWith("Configuration serveur");
}

function isPrismaDbConfigError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const m = e.message;
  return (
    m.includes("Environment variable not found") ||
    m.includes("DATABASE_URL") ||
    m.includes("DIRECT_URL") ||
    m.includes("Can't reach database server") ||
    m.includes("P1001") ||
    e.name === "PrismaClientInitializationError"
  );
}

export function handleRouteError(e: unknown) {
  if (isConfigurationError(e)) {
    return jsonError(e.message, 503);
  }
  if (e instanceof Error) {
    if (e.message === "UNAUTHORIZED" && "status" in e && typeof (e as { status: number }).status === "number") {
      return jsonError("Non authentifié", (e as { status: number }).status);
    }
    if (e.message === "FORBIDDEN" && "status" in e && typeof (e as { status: number }).status === "number") {
      return jsonError("Accès refusé", (e as { status: number }).status);
    }
  }
  if (isPrismaDbConfigError(e) && e instanceof Error) {
    return jsonError(
      `Base de données inaccessible ou variables manquantes: ${e.message.slice(0, 280)}`,
      503,
    );
  }
  console.error(e);
  return jsonError("Erreur serveur", 500);
}
