import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { deleteTag, updateTag } from "@/services/tag.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    if (!isAdmin(user.role)) return jsonError("Accès refusé", 403);
    const { id } = await ctx.params;
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400);
    const tag = await updateTag(id, parsed.data);
    return NextResponse.json({ tag });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    if (!isAdmin(user.role)) return jsonError("Accès refusé", 403);
    const { id } = await ctx.params;
    await deleteTag(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
