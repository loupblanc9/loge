import { NextResponse } from "next/server";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { resolveSafeUploadPath } from "@/lib/files/safe-local-path";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ path: string[] }> };

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

/** URL stockée en base : `/api/files/${encodeURIComponent(key)}` */
function findDbMetaForKey(key: string): Promise<{ mimeType: string | null; fileName: string | null } | null> {
  const publicUrl = `/api/files/${encodeURIComponent(key)}`;
  return prisma.document
    .findFirst({
      where: { fileUrl: publicUrl },
      select: { mimeType: true, fileName: true },
    })
    .then((doc) => {
      if (doc) return doc;
      return prisma.guarantorDocument.findFirst({
        where: { fileUrl: publicUrl },
        select: { mimeType: true, fileName: true },
      });
    });
}

function guessMimeFromName(name: string | null): string | null {
  if (!name) return null;
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!m) return null;
  switch (m[1]) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    default:
      return null;
  }
}

/**
 * Lecture directe depuis le disque — **uniquement** si `STORAGE_DRIVER=local`.
 * Supabase : URLs signées. S3 : à traiter séparément (presign ou autre) — pas ce routeur.
 */
export async function GET(req: Request, ctx: Ctx) {
  try {
    if (getEnv().STORAGE_DRIVER !== "local") {
      return jsonError(
        "Ce point de terminaison fichier n’est actif qu’en STORAGE_DRIVER=local. Utilisez les URLs signées Supabase.",
        404,
      );
    }

    const user = await requireAuth();
    const { path: segments } = await ctx.params;
    if (!segments?.length) return jsonError("Chemin invalide", 400);
    const key = segments.map((s) => decodeURIComponent(s)).join("/");
    const { searchParams } = new URL(req.url);
    const download = searchParams.get("download") === "1";

    if (!(await canAccessFile(user.id, isAdmin(user.role), key))) {
      return jsonError("Accès refusé", 403);
    }

    const dbMeta = await findDbMetaForKey(key);
    const mime =
      dbMeta?.mimeType ?? guessMimeFromName(dbMeta?.fileName ?? null) ?? "application/octet-stream";
    const safeName = (dbMeta?.fileName ?? segments.at(-1) ?? "file").replace(/[^\w.\- ()]/g, "_");
    const disposition = download ? "attachment" : "inline";

    const full = resolveSafeUploadPath(segments as string[]);
    if (!full) return jsonError("Chemin invalide", 400);
    const stat = await fs.stat(full).catch(() => null);
    if (!stat) return jsonError("Fichier introuvable", 404);
    const stream = createReadStream(full);
    return new NextResponse(Readable.toWeb(stream) as BodyInit, {
      headers: {
        "Content-Length": String(stat.size),
        "Content-Type": mime,
        "Content-Disposition": `${disposition}; filename="${safeName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
