import { NextResponse } from "next/server";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { normalizeStorageObjectKey } from "@/lib/storage/normalize-storage-path";
import { fetchSupabaseObjectResponse } from "@/services/storage-proxy-fetch.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ guarantorId: string; docId: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    if (getEnv().STORAGE_DRIVER !== "supabase") {
      return jsonError(
        "Fichiers Supabase : définissez STORAGE_DRIVER=supabase et les variables SUPABASE_* sur ce déploiement.",
        503,
      );
    }

    const user = await requireAuth();
    const { guarantorId, docId } = await ctx.params;
    const download = new URL(req.url).searchParams.get("download") === "1";

    const guarantor = await prisma.guarantor.findUnique({
      where: { id: guarantorId },
      include: { dossier: { select: { id: true, userId: true } } },
    });
    if (!guarantor) return jsonError("Garant introuvable", 404);
    const dossier = guarantor.dossier;
    if (!isAdmin(user.role) && dossier.userId !== user.id) {
      return jsonError("Accès refusé", 403);
    }

    const doc = await prisma.guarantorDocument.findFirst({
      where: { id: docId, guarantorId },
      select: { storagePath: true, fileName: true, mimeType: true },
    });
    if (!doc?.storagePath) {
      return jsonError("Fichier introuvable", 404);
    }

    const bucket = getEnv().SUPABASE_STORAGE_BUCKET || "documents";
    const keyNorm = normalizeStorageObjectKey(doc.storagePath, bucket);
    const prefix = `${dossier.userId}/${dossier.id}/`;
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
