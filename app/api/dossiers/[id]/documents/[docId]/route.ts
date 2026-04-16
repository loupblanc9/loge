import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import {
  setTenantDocumentStatus,
  uploadTenantDocument,
} from "@/services/document.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";
import { getEnv } from "@/lib/env";
import { zDocumentStatus } from "@/lib/constants/validation";

type Ctx = { params: Promise<{ id: string; docId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id, docId } = await ctx.params;
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return jsonError("Fichier manquant (champ « file »)", 400);
    }
    if (file.size > getEnv().MAX_FILE_BYTES) {
      return jsonError(`Fichier trop volumineux (max ${getEnv().MAX_FILE_BYTES} octets)`, 400);
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await uploadTenantDocument(id, docId, buf, file.name, file.type || "application/octet-stream", {
      userId: user.id,
      admin: isAdmin(user.role),
    });
    if (result.error === "NOT_FOUND") return jsonError("Dossier ou document introuvable", 404);
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
    const { id, docId } = await ctx.params;
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400);
    const doc = await setTenantDocumentStatus(id, docId, parsed.data.status, {
      admin: isAdmin(user.role),
    });
    if (!doc) return jsonError("Document introuvable", 404);
    return NextResponse.json({ document: doc });
  } catch (e) {
    return handleRouteError(e);
  }
}
