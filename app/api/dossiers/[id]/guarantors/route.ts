import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { createGuarantor, listGuarantors } from "@/services/guarantor.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const list = await listGuarantors(id, { userId: user.id, admin: isAdmin(user.role) });
    if (list === null) return jsonError("Dossier introuvable", 404);
    return NextResponse.json({ guarantors: list });
  } catch (e) {
    return handleRouteError(e);
  }
}

const postSchema = z.object({
  name: z.string().optional(),
});

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const json = await req.json().catch(() => ({}));
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400);
    const g = await createGuarantor(id, parsed.data.name, {
      userId: user.id,
      admin: isAdmin(user.role),
    });
    if (!g) return jsonError("Dossier introuvable", 404);
    return NextResponse.json({ guarantor: g }, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
