import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { approveAllDocuments, rejectAllUploadedDocuments } from "@/services/document.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  action: z.enum(["approveAll", "rejectAllUploaded"]),
});

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    if (!isAdmin(user.role)) return jsonError("Accès refusé", 403);
    const { id } = await ctx.params;
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400);
    if (parsed.data.action === "approveAll") {
      await approveAllDocuments(id, { admin: true });
    } else {
      await rejectAllUploadedDocuments(id, { admin: true });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
