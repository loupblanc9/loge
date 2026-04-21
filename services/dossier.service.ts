import type { DossierStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GUARANTOR_DOCUMENT_TYPES, PRIVATE_DOCUMENT_TYPES, SOCIAL_DOCUMENT_TYPES, TENANT_DOCUMENT_TYPES } from "@/lib/constants/document-types";
import {
  dossierListInclude,
  recalculateDossier,
  serializeDossierForTable,
} from "@/services/dossier-metadata.service";

const DEFAULT_PAGE_SIZE = 20;
const RECENT_DAYS = 7;

async function nextReference(tx: Prisma.TransactionClient): Promise<string> {
  const seq = await tx.dossierSequence.upsert({
    where: { id: "default" },
    create: { id: "default", value: 1 },
    update: { value: { increment: 1 } },
  });
  const n = seq.value;
  return `DOSSIER-${String(n).padStart(4, "0")}`;
}

export type ListDossiersQuery = {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  status?: DossierStatus[];
  progressMin?: number;
  progressMax?: number;
  isOpened?: boolean;
  missingDocuments?: boolean;
  dossierComplet?: boolean;
  tagIds?: string[];
  createdFrom?: Date;
  createdTo?: Date;
  updatedFrom?: Date;
  updatedTo?: Date;
  /** notOpened | recent | pending (file métier = statut en vérification) */
  activity?: string[];
  dossierTypes?: ("social" | "prive")[];
};

function parseMulti<T extends string>(v: string | null): T[] | undefined {
  if (!v) return undefined;
  return v.split(",").map((s) => s.trim()).filter(Boolean) as T[];
}

export function parseListQuery(searchParams: URLSearchParams): ListDossiersQuery {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_PAGE_SIZE)));
  const sort = searchParams.get("sort") ?? "updatedAt:desc";
  const q = searchParams.get("q") ?? undefined;
  const statusRaw = searchParams.getAll("status").length
    ? searchParams.getAll("status")
    : parseMulti(searchParams.get("statuses") ?? "");
  const status = statusRaw as DossierStatus[] | undefined;
  const progressMin = searchParams.get("progressMin") ? Number(searchParams.get("progressMin")) : undefined;
  const progressMax = searchParams.get("progressMax") ? Number(searchParams.get("progressMax")) : undefined;
  const isOpenedParam = searchParams.get("isOpened");
  const isOpened =
    isOpenedParam === null ? undefined : isOpenedParam === "true" ? true : isOpenedParam === "false" ? false : undefined;
  const missingDocuments = searchParams.get("missingDocuments") === "true" ? true : undefined;
  const dossierComplet = searchParams.get("dossierComplet") === "true" ? true : undefined;
  const tagIds = searchParams.getAll("tagId").length
    ? searchParams.getAll("tagId")
    : parseMulti(searchParams.get("tagIds") ?? "");
  const activity = parseMulti(searchParams.get("activity") ?? "") ?? searchParams.getAll("activity");

  const dossierTypeRaw = searchParams.getAll("dossierType").length
    ? searchParams.getAll("dossierType")
    : parseMulti(searchParams.get("dossierTypes") ?? "");
  const dossierTypes = dossierTypeRaw as ("social" | "prive")[] | undefined;

  const createdFrom = searchParams.get("createdFrom") ? new Date(searchParams.get("createdFrom")!) : undefined;
  const createdTo = searchParams.get("createdTo") ? new Date(searchParams.get("createdTo")!) : undefined;
  const updatedFrom = searchParams.get("updatedFrom") ? new Date(searchParams.get("updatedFrom")!) : undefined;
  const updatedTo = searchParams.get("updatedTo") ? new Date(searchParams.get("updatedTo")!) : undefined;

  return {
    page,
    limit,
    sort,
    q,
    status: status?.length ? status : undefined,
    progressMin,
    progressMax,
    isOpened,
    missingDocuments,
    dossierComplet,
    tagIds: tagIds?.length ? tagIds : undefined,
    createdFrom,
    createdTo,
    updatedFrom,
    updatedTo,
    activity: activity?.length ? activity : undefined,
    dossierTypes: dossierTypes?.length ? dossierTypes : undefined,
  };
}

function buildWhere(
  query: ListDossiersQuery,
  opts: { userId?: string; admin: boolean },
): Prisma.DossierWhereInput {
  const and: Prisma.DossierWhereInput[] = [];

  if (!opts.admin && opts.userId) {
    and.push({ userId: opts.userId });
  }

  if (query.status?.length) {
    and.push({ status: { in: query.status } });
  }

  if (query.progressMin !== undefined || query.progressMax !== undefined) {
    and.push({
      progress: {
        gte: query.progressMin ?? 0,
        lte: query.progressMax ?? 100,
      },
    });
  }

  if (query.isOpened !== undefined) {
    and.push({ isOpened: query.isOpened });
  }

  if (query.tagIds?.length) {
    and.push({
      dossierTags: { some: { tagId: { in: query.tagIds } } },
    });
  }

  if (query.createdFrom || query.createdTo) {
    and.push({
      createdAt: {
        gte: query.createdFrom,
        lte: query.createdTo,
      },
    });
  }

  if (query.updatedFrom || query.updatedTo) {
    and.push({
      updatedAt: {
        gte: query.updatedFrom,
        lte: query.updatedTo,
      },
    });
  }

  if (query.activity?.length) {
    const actOr: Prisma.DossierWhereInput[] = [];
    for (const a of query.activity) {
      if (a === "notOpened") actOr.push({ isOpened: false });
      if (a === "pending") actOr.push({ status: "in_review" });
      if (a === "recent") {
        const since = new Date();
        since.setDate(since.getDate() - RECENT_DAYS);
        actOr.push({ updatedAt: { gte: since } });
      }
    }
    if (actOr.length) and.push({ OR: actOr });
  }

  if (query.missingDocuments) {
    and.push({
      OR: [
        { documents: { some: { status: "missing" } } },
        { guarantors: { some: { documents: { some: { status: "missing" } } } } },
      ],
    });
  }

  if (query.dossierComplet) {
    and.push({ status: "validated", progress: 100 });
  }

  if (query.q?.trim()) {
    const term = query.q.trim();
    and.push({
      OR: [
        { reference: { contains: term, mode: "insensitive" } },
        { title: { contains: term, mode: "insensitive" } },
        { user: { email: { contains: term, mode: "insensitive" } } },
        { user: { name: { contains: term, mode: "insensitive" } } },
      ],
    });
  }

  return and.length ? { AND: and } : {};
}

function orderByFromSort(sort: string): Prisma.DossierOrderByWithRelationInput[] {
  const [field, dir] = sort.split(":");
  const direction = dir === "asc" ? "asc" : "desc";
  const allowed = ["createdAt", "updatedAt", "progress", "reference", "status"];
  const f = allowed.includes(field) ? field : "updatedAt";
  return [{ [f]: direction }];
}

export async function createDossier(userId: string, title?: string) {
  return createDossierWithType(userId, "prive", title);
}

export async function createDossierWithType(
  userId: string,
  dossierType: "social" | "prive",
  title?: string,
) {
  const docDefs =
    dossierType === "social"
      ? SOCIAL_DOCUMENT_TYPES
      : dossierType === "prive"
        ? PRIVATE_DOCUMENT_TYPES
        : TENANT_DOCUMENT_TYPES;

  const dossier = await prisma.$transaction(async (tx) => {
    const reference = await nextReference(tx);
    return tx.dossier.create({
      data: {
        reference,
        title: title ?? "",
        userId,
        status: "incomplete",
        progress: 0,
        dossierType,
        documents: {
          create: docDefs.map((d) => ({
            type: d.type,
            status: "missing" as const,
            priority: d.required || d.priority === "high" ? "high" : "normal",
          })),
        },
        ...(dossierType === "prive"
          ? {
              guarantors: {
                create: [
                  {
                    name: "Garant",
                    documents: {
                      create: GUARANTOR_DOCUMENT_TYPES.map((d) => ({
                        type: d.type,
                        status: "missing" as const,
                        priority: d.priority ?? "normal",
                      })),
                    },
                  },
                ],
              },
            }
          : {}),
      },
    });
  });
  await recalculateDossier(dossier.id);
  return prisma.dossier.findUniqueOrThrow({
    where: { id: dossier.id },
    include: dossierListInclude,
  });
}

export async function listDossiers(query: ListDossiersQuery, opts: { userId?: string; admin: boolean }) {
  const where = buildWhere(query, opts);
  const skip = ((query.page ?? 1) - 1) * (query.limit ?? DEFAULT_PAGE_SIZE);
  const take = query.limit ?? DEFAULT_PAGE_SIZE;
  const orderBy = orderByFromSort(query.sort ?? "updatedAt:desc");

  const [total, rows] = await prisma.$transaction([
    prisma.dossier.count({ where }),
    prisma.dossier.findMany({
      where,
      orderBy,
      skip,
      take,
      include: dossierListInclude,
    }),
  ]);

  return {
    data: rows.map(serializeDossierForTable),
    meta: {
      total,
      page: query.page ?? 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
}

export async function getDossierById(id: string, opts: { userId?: string; admin: boolean }) {
  const dossier = await prisma.dossier.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { dossiers: true } },
        },
      },
      documents: true,
      guarantors: { include: { documents: true } },
      dossierTags: { include: { tag: true } },
      notes: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!dossier) return null;
  if (!opts.admin && dossier.userId !== opts.userId) return null;
  return dossier;
}

export async function updateDossier(
  id: string,
  data: { title?: string; status?: DossierStatus },
  opts: { userId?: string; admin: boolean },
) {
  const existing = await prisma.dossier.findUnique({ where: { id } });
  if (!existing) return null;
  if (!opts.admin && existing.userId !== opts.userId) return null;
  if (data.status && !opts.admin) {
    const err = new Error("FORBIDDEN") as Error & { status: number };
    err.status = 403;
    throw err;
  }

  return prisma.dossier.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
    include: dossierListInclude,
  });
}

export async function deleteDossier(id: string, opts: { admin: boolean }) {
  if (!opts.admin) {
    const err = new Error("FORBIDDEN") as Error & { status: number };
    err.status = 403;
    throw err;
  }
  await prisma.dossier.delete({ where: { id } });
}

export async function markDossierOpened(id: string, userId: string, admin: boolean) {
  const d = await prisma.dossier.findUnique({ where: { id } });
  if (!d) return null;
  if (!admin && d.userId !== userId) return null;
  return prisma.dossier.update({
    where: { id },
    data: { isOpened: true, openedAt: d.openedAt ?? new Date() },
  });
}
