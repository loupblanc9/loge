import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { addNote, listNotes } from "@/services/note.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const notes = await listNotes(id, { admin: isAdmin(user.role), userId: user.id });
    if (notes === null) return jsonError("Dossier introuvable ou accès refusé", 404);
    return NextResponse.json({ notes });
  } catch (e) {
    return handleRouteError(e);
  }
}

const postSchema = z.object({
  content: z.string().min(1),
});

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const json = await req.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400);
    const note = await addNote(id, user.id, parsed.data.content, { admin: isAdmin(user.role) });
    if (!note) return jsonError("Dossier introuvable", 404);
    return NextResponse.json({ note }, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
