import { NextResponse } from "next/server";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { normalizeStorageObjectKey } from "@/lib/storage/normalize-storage-path";
import { createSupabaseSignedUrl } from "@/services/storage-signed-url.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ id: string; docId: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id: dossierId, docId } = await ctx.params;
    const download = new URL(req.url).searchParams.get("download") === "1";

    const dossier = await prisma.dossier.findUnique({
      where: { id: dossierId },
      select: { userId: true },
    });
    if (!dossier) return jsonError("Dossier introuvable", 404);
    if (!isAdmin(user.role) && dossier.userId !== user.id) {
      return jsonError("Accès refusé", 403);
    }

    const doc = await prisma.document.findFirst({
      where: { id: docId, dossierId },
      select: { storagePath: true, fileName: true },
    });
    if (!doc?.storagePath) {
      return jsonError("Fichier introuvable", 404);
    }

    const keyNorm = normalizeStorageObjectKey(doc.storagePath, getEnv().SUPABASE_STORAGE_BUCKET || "documents");
    const prefix = `${dossier.userId}/${dossierId}/`;
    if (!keyNorm.startsWith(prefix)) {
      return jsonError("Fichier introuvable", 404);
    }

    const signed = await createSupabaseSignedUrl(doc.storagePath, {
      download,
      fileName: doc.fileName ?? undefined,
    });
    if ("error" in signed) {
      return jsonError(signed.error, 503);
    }
    return NextResponse.json({ signedUrl: signed.signedUrl, expiresAt: signed.expiresAt });
  } catch (e) {
    return handleRouteError(e);
  }
}
