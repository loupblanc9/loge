import { NextResponse } from "next/server";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { markDossierOpened } from "@/services/dossier.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

type Ctx = { params: Promise<{ id: string }> };

/** Marque le dossier comme ouvert (filtre activité / UX split view). */
export async function POST(_req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const d = await markDossierOpened(id, user.id, isAdmin(user.role));
    if (!d) return jsonError("Dossier introuvable", 404);
    return NextResponse.json({ dossier: d });
  } catch (e) {
    return handleRouteError(e);
  }
}
