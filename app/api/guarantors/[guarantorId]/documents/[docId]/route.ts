import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import {
  setGuarantorDocumentStatus,
  uploadGuarantorDocument,
} from "@/services/document.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";
import { getFormDataFileBlob, uploadDeclaredMime, uploadOriginalName } from "@/lib/api/form-file";
import { getEnv } from "@/lib/env";
import { zDocumentStatus } from "@/lib/constants/validation";

type Ctx = { params: Promise<{ guarantorId: string; docId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { guarantorId, docId } = await ctx.params;
    const form = await req.formData();
    const blob = getFormDataFileBlob(form, "file");
    if (!blob) {
      return jsonError("Fichier manquant (champ « file »)", 400);
    }
    if (blob.size > getEnv().MAX_FILE_BYTES) {
      return jsonError(`Fichier trop volumineux (max ${getEnv().MAX_FILE_BYTES} octets)`, 400);
    }
    const buf = Buffer.from(await blob.arrayBuffer());
    const result = await uploadGuarantorDocument(
      guarantorId,
      docId,
      buf,
      uploadOriginalName(blob),
      uploadDeclaredMime(blob),
      { userId: user.id, admin: isAdmin(user.role) },
    );
    if (result.error === "NOT_FOUND") return jsonError("Garant ou document introuvable", 404);
    if (result.error === "FORBIDDEN") return jsonError("Accès refusé", 403);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof Error && "status" in e && typeof (e as { status: number }).status === "number") {
      return jsonError(e.message, (e as { status: number }).status);
    }
    return handleRouteError(e);
  }
}

const patchSchema = z.object({
  status: zDocumentStatus,
});

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { guarantorId, docId } = await ctx.params;
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400);
    const doc = await setGuarantorDocumentStatus(guarantorId, docId, parsed.data.status, {
      admin: isAdmin(user.role),
    });
    if (!doc) return jsonError("Document introuvable", 404);
    return NextResponse.json({ document: doc });
  } catch (e) {
    return handleRouteError(e);
  }
}
