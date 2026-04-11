import { prisma } from "@/lib/prisma";

export async function listTags() {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}

export async function createTag(name: string, color: string) {
  return prisma.tag.create({
    data: { name: name.trim(), color },
  });
}

export async function updateTag(id: string, data: { name?: string; color?: string }) {
  return prisma.tag.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
    },
  });
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
}

export async function attachTagToDossier(dossierId: string, tagId: string, opts: { admin: boolean; userId: string }) {
  const d = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!d) return null;
  if (!opts.admin && d.userId !== opts.userId) {
    const err = new Error("FORBIDDEN") as Error & { status: number };
    err.status = 403;
    throw err;
  }
  return prisma.dossierTag.create({
    data: { dossierId, tagId },
    include: { tag: true },
  });
}

export async function detachTagFromDossier(dossierId: string, tagId: string, opts: { admin: boolean; userId: string }) {
  const d = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!d) return null;
  if (!opts.admin && d.userId !== opts.userId) {
    const err = new Error("FORBIDDEN") as Error & { status: number };
    err.status = 403;
    throw err;
  }
  await prisma.dossierTag.deleteMany({ where: { dossierId, tagId } });
  return true;
}
