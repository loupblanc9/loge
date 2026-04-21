import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/get-session";
import { getClientDetailForAdmin, updateClientByAdmin } from "@/services/admin-clients.service";
import { jsonError, handleRouteError } from "@/lib/api/errors";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().max(40).nullable().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const detail = await getClientDetailForAdmin(id);
    if (!detail) return jsonError("Client introuvable", 404);

    const { dossiers, ...user } = detail;
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        dossierCount: user._count.dossiers,
      },
      dossiers: dossiers.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        openedAt: d.openedAt?.toISOString() ?? null,
        documents: d.documents.map((doc) => ({
          ...doc,
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString(),
        })),
        guarantors: d.guarantors.map((g) => ({
          ...g,
          createdAt: g.createdAt.toISOString(),
          documents: g.documents.map((doc) => ({
            ...doc,
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString(),
          })),
        })),
        notes: d.notes.map((n) => ({
          ...n,
          createdAt: n.createdAt.toISOString(),
        })),
      })),
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) return jsonError("Données invalides", 400);
    const { name, phone: phoneRaw } = parsed.data;
    const updatePayload: { name?: string; phone?: string | null } = {};
    if (name !== undefined) updatePayload.name = name;
    if (phoneRaw !== undefined) {
      updatePayload.phone = phoneRaw === null || phoneRaw === "" ? null : phoneRaw.trim() || null;
    }
    const result = await updateClientByAdmin(id, updatePayload);
    if (!result.ok) return jsonError("Client introuvable", 404);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
