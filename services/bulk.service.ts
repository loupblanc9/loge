import type { DossierStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recalculateDossier } from "@/services/dossier-metadata.service";

export async function bulkAddTag(dossierIds: string[], tagId: string) {
  const data = dossierIds.map((dossierId) => ({ dossierId, tagId }));
  await prisma.dossierTag.createMany({ data, skipDuplicates: true });
}

/** Statut dossier forcé côté admin (sans recalcul auto — la prochaine action sur documents resynchronisera si besoin). */
export async function bulkSetStatus(dossierIds: string[], status: DossierStatus) {
  await prisma.dossier.updateMany({
    where: { id: { in: dossierIds } },
    data: { status },
  });
}

/** « Marquer comme traité » — aligné maquette : passage en complet si possible, sinon review laissé au métier */
export async function bulkMarkProcessed(dossierIds: string[]) {
  for (const id of dossierIds) {
    await recalculateDossier(id);
    const d = await prisma.dossier.findUnique({
      where: { id },
      include: {
        documents: { select: { status: true } },
        guarantors: { include: { documents: { select: { status: true } } } },
      },
    });
    if (!d) continue;
    const all = [...d.documents, ...d.guarantors.flatMap((g) => g.documents)];
    const allApproved = all.length > 0 && all.every((x) => x.status === "approved");
    await prisma.dossier.update({
      where: { id },
      data: { status: allApproved ? "complete" : "review" },
    });
  }
}

export async function bulkDeleteDossiers(dossierIds: string[]) {
  await prisma.dossier.deleteMany({ where: { id: { in: dossierIds } } });
}

export async function exportDossiersJson(dossierIds: string[]) {
  return prisma.dossier.findMany({
    where: { id: { in: dossierIds } },
    include: {
      user: { select: { id: true, email: true, name: true } },
      documents: true,
      guarantors: { include: { documents: true } },
      dossierTags: { include: { tag: true } },
      notes: { include: { author: { select: { name: true, email: true } } } },
    },
  });
}
