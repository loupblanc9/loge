import type { DossierStatus, DocumentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { labelForType } from "@/lib/constants/document-types";

type DocLike = { status: DocumentStatus };

function aggregateDocStates(docs: DocLike[]): {
  total: number;
  approved: number;
  missing: number;
  pendingUpload: number;
} {
  let approved = 0;
  let missing = 0;
  let pendingUpload = 0;
  for (const d of docs) {
    if (d.status === "approved") approved++;
    else if (d.status === "missing") missing++;
    else if (d.status === "uploaded" || d.status === "rejected") pendingUpload++;
  }
  return { total: docs.length, approved, missing, pendingUpload };
}

function computeDossierStatus(states: ReturnType<typeof aggregateDocStates>): DossierStatus {
  if (states.missing > 0) return "incomplete";
  if (states.pendingUpload > 0) return "in_review";
  if (states.total === 0) return "incomplete";
  return "validated";
}

function computeProgress(states: ReturnType<typeof aggregateDocStates>): number {
  if (states.total === 0) return 0;
  return Math.round((states.approved / states.total) * 100);
}

/** Recalcule progress, statut global, et persiste. */
export async function recalculateDossier(dossierId: string): Promise<void> {
  const dossier = await prisma.dossier.findUnique({
    where: { id: dossierId },
    include: {
      documents: { select: { status: true } },
      guarantors: { include: { documents: { select: { status: true } } } },
    },
  });
  if (!dossier) return;

  const all: DocLike[] = [...dossier.documents];
  for (const g of dossier.guarantors) {
    all.push(...g.documents);
  }

  const states = aggregateDocStates(all);
  const progress = computeProgress(states);
  const computed = computeDossierStatus(states);

  /** Refus et « en attente » métier : on ne réécrit pas le statut automatiquement (seulement la progression). */
  if (dossier.status === "rejected" || dossier.status === "pending") {
    await prisma.dossier.update({
      where: { id: dossierId },
      data: { progress },
    });
    return;
  }

  await prisma.dossier.update({
    where: { id: dossierId },
    data: { progress, status: computed },
  });
}

export async function buildMissingSummary(dossierId: string): Promise<{
  missingCount: number;
  summary: string;
  missingLabels: string[];
}> {
  const dossier = await prisma.dossier.findUnique({
    where: { id: dossierId },
    include: {
      documents: { where: { status: "missing" }, select: { type: true, priority: true } },
      guarantors: {
        include: {
          documents: { where: { status: "missing" }, select: { type: true, priority: true } },
        },
      },
    },
  });
  if (!dossier) {
    return { missingCount: 0, summary: "0 manquants", missingLabels: [] };
  }

  const labels: string[] = [];
  for (const d of dossier.documents) {
    labels.push(labelForType(d.type));
  }
  for (const g of dossier.guarantors) {
    for (const d of g.documents) {
      labels.push(labelForType(d.type));
    }
  }

  const missingCount = labels.length;
  let summary: string;
  if (missingCount === 0) summary = "0 manquants";
  else if (missingCount === 1) summary = `1 document : ${labels[0]}`;
  else summary = `${missingCount} documents manquants`;

  return { missingCount, summary, missingLabels: labels };
}

export const dossierListInclude = {
  user: { select: { id: true, email: true, name: true, phone: true, avatarUrl: true } },
  dossierTags: { include: { tag: true } },
  documents: { select: { id: true, type: true, status: true } },
  guarantors: { include: { documents: { select: { id: true, status: true } } } },
} satisfies Prisma.DossierInclude;

export type DossierListRow = Prisma.DossierGetPayload<{ include: typeof dossierListInclude }>;

export function serializeDossierForTable(row: DossierListRow) {
  const tenantDocs = row.documents;
  const gDocs = row.guarantors.flatMap((g) => g.documents);
  const all = [...tenantDocs, ...gDocs];
  const approved = all.filter((d) => d.status === "approved").length;
  const total = all.length;
  const missing = all.filter((d) => d.status === "missing").length;

  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    status: row.status,
    progress: row.progress,
    isOpened: row.isOpened,
    openedAt: row.openedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: row.user,
    tags: row.dossierTags.map((dt) => ({
      id: dt.tag.id,
      name: dt.tag.name,
      color: dt.tag.color,
    })),
    documentsStats: {
      approved,
      total,
      missing,
      ratioLabel: total ? `${approved}/${total} documents` : "0/0 documents",
      hasMissing: missing > 0,
    },
    dossierType: row.dossierType,
  };
}
