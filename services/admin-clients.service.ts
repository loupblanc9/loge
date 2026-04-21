import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DossierStatus } from "@prisma/client";

const PAGE_SIZE = 20;

export type AdminClientListRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  createdAt: Date;
  dossierCount: number;
  /** Statut du dossier le plus récemment modifié (indicateur métier) */
  lastDossierStatus: DossierStatus | null;
};

export async function listClientsForAdmin(opts: { q?: string; page: number }) {
  const page = Math.max(1, opts.page);
  const take = PAGE_SIZE;
  const skip = (page - 1) * take;

  const where: Prisma.UserWhereInput = { role: "client" };
  const q = opts.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        _count: { select: { dossiers: true } },
        dossiers: {
          take: 1,
          orderBy: { updatedAt: "desc" },
          select: { status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  const data: AdminClientListRow[] = rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    phone: r.phone,
    createdAt: r.createdAt,
    dossierCount: r._count.dossiers,
    lastDossierStatus: r.dossiers[0]?.status ?? null,
  }));

  return {
    data,
    meta: { total, page, limit: take, totalPages: Math.ceil(total / take) || 1 },
  };
}

export async function getClientDetailForAdmin(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "client" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
      _count: { select: { dossiers: true } },
      dossiers: {
        orderBy: { updatedAt: "desc" },
        include: {
          documents: true,
          guarantors: { include: { documents: true } },
          notes: {
            orderBy: { createdAt: "desc" },
            take: 100,
            include: { author: { select: { id: true, name: true, email: true } } },
          },
          dossierTags: { include: { tag: true } },
        },
      },
    },
  });
  return user;
}

export async function updateClientByAdmin(
  userId: string,
  data: { name?: string; phone?: string | null },
): Promise<{ ok: true } | { ok: false; error: "NOT_FOUND" }> {
  const u = await prisma.user.findFirst({
    where: { id: userId, role: "client" },
    select: { id: true },
  });
  if (!u) return { ok: false, error: "NOT_FOUND" };
  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    },
  });
  return { ok: true };
}
