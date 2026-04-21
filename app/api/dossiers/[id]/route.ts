import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAdmin } from "@/lib/auth/get-session";
import { deleteDossier, getDossierById, updateDossier } from "@/services/dossier.service";
import { buildMissingSummary } from "@/services/dossier-metadata.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";
import type { DossierStatus } from "@prisma/client";
import { zDossierStatus } from "@/lib/constants/dossier-status";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const dossier = await getDossierById(id, { admin: isAdmin(user.role), userId: user.id });
    if (!dossier) return jsonError("Dossier introuvable", 404);
    const missing = await buildMissingSummary(id);
    const { user: u, ...rest } = dossier;
    const uc = u as typeof u & { _count: { dossiers: number } };
    return NextResponse.json({
      dossier: {
        ...rest,
        user: {
          id: uc.id,
          email: uc.email,
          name: uc.name,
          phone: uc.phone ?? null,
          avatarUrl: uc.avatarUrl,
          dossierCount: uc._count.dossiers,
          memberSince: uc.createdAt.toISOString(),
        },
        missingSummary: missing.summary,
        missingCount: missing.missingCount,
        missingLabels: missing.missingLabels,
      },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

const patchSchema = z.object({
  title: z.string().optional(),
  status: zDossierStatus.optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400);
    const updated = await updateDossier(
      id,
      { title: parsed.data.title, status: parsed.data.status as DossierStatus | undefined },
      { admin: isAdmin(user.role), userId: user.id },
    );
    if (!updated) return jsonError("Dossier introuvable", 404);
    return NextResponse.json({ dossier: updated });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    if (!isAdmin(user.role)) return jsonError("Accès refusé", 403);
    const { id } = await ctx.params;
    await deleteDossier(id, { admin: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
