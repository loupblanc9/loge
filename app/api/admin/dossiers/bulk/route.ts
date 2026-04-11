import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import {
  bulkAddTag,
  bulkDeleteDossiers,
  bulkMarkProcessed,
  bulkSetStatus,
  exportDossiersJson,
} from "@/services/bulk.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";
import type { DossierStatus } from "@prisma/client";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("addTag"),
    dossierIds: z.array(z.string()).min(1),
    tagId: z.string(),
  }),
  z.object({
    action: z.literal("setStatus"),
    dossierIds: z.array(z.string()).min(1),
    status: z.enum(["incomplete", "review", "complete"]),
  }),
  z.object({
    action: z.literal("markProcessed"),
    dossierIds: z.array(z.string()).min(1),
  }),
  z.object({
    action: z.literal("delete"),
    dossierIds: z.array(z.string()).min(1),
  }),
  z.object({
    action: z.literal("export"),
    dossierIds: z.array(z.string()).min(1),
  }),
]);

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!isAdmin(user.role)) return jsonError("Accès refusé", 403);
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400, { details: parsed.error.flatten() });

    const body = parsed.data;
    switch (body.action) {
      case "addTag":
        await bulkAddTag(body.dossierIds, body.tagId);
        return NextResponse.json({ ok: true, affected: body.dossierIds.length });
      case "setStatus":
        await bulkSetStatus(body.dossierIds, body.status as DossierStatus);
        return NextResponse.json({ ok: true, affected: body.dossierIds.length });
      case "markProcessed":
        await bulkMarkProcessed(body.dossierIds);
        return NextResponse.json({ ok: true, affected: body.dossierIds.length });
      case "delete":
        await bulkDeleteDossiers(body.dossierIds);
        return NextResponse.json({ ok: true, affected: body.dossierIds.length });
      case "export": {
        const data = await exportDossiersJson(body.dossierIds);
        return NextResponse.json({ dossiers: data });
      }
      default:
        return jsonError("Action inconnue", 400);
    }
  } catch (e) {
    return handleRouteError(e);
  }
}
