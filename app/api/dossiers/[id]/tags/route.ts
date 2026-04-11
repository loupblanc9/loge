import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { attachTagToDossier, detachTagFromDossier } from "@/services/tag.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ id: string }> };

const postSchema = z.object({
  tagId: z.string().min(1),
});

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const json = await req.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400);
    const row = await attachTagToDossier(id, parsed.data.tagId, {
      admin: isAdmin(user.role),
      userId: user.id,
    });
    if (!row) return jsonError("Dossier introuvable", 404);
    return NextResponse.json({ dossierTag: row }, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const tagId = searchParams.get("tagId");
    if (!tagId) return jsonError("tagId requis", 400);
    const result = await detachTagFromDossier(id, tagId, {
      admin: isAdmin(user.role),
      userId: user.id,
    });
    if (result === null) return jsonError("Dossier introuvable", 404);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
