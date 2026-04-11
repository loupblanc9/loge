import { NextResponse } from "next/server";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { resolveSafeUploadPath } from "@/lib/files/safe-local-path";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage/factory";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ path: string[] }> };

/** Vérifie que l'utilisateur peut lire ce fichier (dossier locataire ou admin). */
async function canAccessFile(userId: string, admin: boolean, key: string): Promise<boolean> {
  if (admin) return true;
  const dossierId = key.split("/")[0];
  if (!dossierId) return false;
  const d = await prisma.dossier.findFirst({
    where: { id: dossierId, userId },
    select: { id: true },
  });
  return !!d;
}

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { path: segments } = await ctx.params;
    if (!segments?.length) return jsonError("Chemin invalide", 400);
    const key = segments.map((s) => decodeURIComponent(s)).join("/");

    if (!(await canAccessFile(user.id, isAdmin(user.role), key))) {
      return jsonError("Accès refusé", 403);
    }

    if (getEnv().STORAGE_DRIVER === "local") {
      const full = resolveSafeUploadPath(segments);
      if (!full) return jsonError("Chemin invalide", 400);
      const stat = await fs.stat(full).catch(() => null);
      if (!stat) return jsonError("Fichier introuvable", 404);
      const stream = createReadStream(full);
      return new NextResponse(Readable.toWeb(stream) as BodyInit, {
        headers: {
          "Content-Length": String(stat.size),
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `inline; filename="${segments.at(-1) ?? "file"}"`,
        },
      });
    }

    const storage = getStorage();
    const stream = await storage.getReadStream(key);
    return new NextResponse(Readable.toWeb(stream as Readable) as BodyInit, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
