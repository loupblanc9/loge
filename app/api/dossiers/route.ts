import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { createDossierWithType, listDossiers, parseListQuery } from "@/services/dossier.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const query = parseListQuery(searchParams);
    const result = await listDossiers(query, {
      admin: isAdmin(user.role),
      userId: isAdmin(user.role) ? undefined : user.id,
    });
    return NextResponse.json(result);
  } catch (e) {
    return handleRouteError(e);
  }
}

const createSchema = z.object({
  title: z.string().optional(),
  dossierType: z.enum(["social", "prive"]).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const json = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400);
    const row = await createDossierWithType(user.id, parsed.data.dossierType ?? "prive", parsed.data.title);
    return NextResponse.json({ dossier: row }, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
