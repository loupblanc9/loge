import { NextResponse } from "next/server";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { normalizeStorageObjectKey } from "@/lib/storage/normalize-storage-path";
import { fetchSupabaseObjectResponse } from "@/services/storage-proxy-fetch.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ id: string; docId: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    if (getEnv().STORAGE_DRIVER !== "supabase") {
      return jsonError(
        "Fichiers Supabase : définissez STORAGE_DRIVER=supabase et les variables SUPABASE_* sur ce déploiement.",
        503,
      );
    }

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
      select: { storagePath: true, fileName: true, mimeType: true },
    });
    if (!doc?.storagePath) {
      return jsonError("Fichier introuvable", 404);
    }

    const bucket = getEnv().SUPABASE_STORAGE_BUCKET || "documents";
    const keyNorm = normalizeStorageObjectKey(doc.storagePath, bucket);
    const prefix = `${dossier.userId}/${dossierId}/`;
    if (!keyNorm.startsWith(prefix)) {
      return jsonError("Fichier introuvable", 404);
    }

    const upstream = await fetchSupabaseObjectResponse(doc.storagePath, {
      download,
      fileName: doc.fileName ?? undefined,
    });
    if ("error" in upstream) {
      const cfg = upstream.error.includes("STORAGE_DRIVER");
      return jsonError(upstream.error, cfg ? 503 : 502);
    }

    const safeName = (doc.fileName ?? "document").replace(/[^\w.\- ()]/g, "_");
    const disposition = download ? "attachment" : "inline";
    const contentType =
      doc.mimeType?.trim() || upstream.headers.get("content-type") || "application/octet-stream";

    if (!upstream.body) {
      const buf = Buffer.from(await upstream.arrayBuffer());
      return new NextResponse(buf, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `${disposition}; filename="${safeName}"`,
          "Cache-Control": "private, no-store",
        },
      });
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
