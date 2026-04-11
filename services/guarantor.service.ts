import { prisma } from "@/lib/prisma";
import { GUARANTOR_DOCUMENT_TYPES } from "@/lib/constants/document-types";
import { recalculateDossier } from "@/services/dossier-metadata.service";

export async function createGuarantor(dossierId: string, name: string | undefined, opts: { userId: string; admin: boolean }) {
  const dossier = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!dossier) return null;
  if (!opts.admin && dossier.userId !== opts.userId) {
    const err = new Error("FORBIDDEN") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const g = await prisma.guarantor.create({
    data: {
      dossierId,
      name,
      documents: {
        create: GUARANTOR_DOCUMENT_TYPES.map((d) => ({
          type: d.type,
          status: "missing" as const,
          priority: d.priority ?? "normal",
        })),
      },
    },
    include: { documents: true },
  });
  await recalculateDossier(dossierId);
  return g;
}

export async function listGuarantors(dossierId: string, opts: { userId: string; admin: boolean }) {
  const dossier = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!dossier) return null;
  if (!opts.admin && dossier.userId !== opts.userId) return null;
  return prisma.guarantor.findMany({
    where: { dossierId },
    include: { documents: true },
    orderBy: { createdAt: "asc" },
  });
}
