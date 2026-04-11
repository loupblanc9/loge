import { prisma } from "@/lib/prisma";

export async function listNotes(dossierId: string, opts: { admin: boolean; userId: string }) {
  if (!opts.admin) {
    const err = new Error("FORBIDDEN") as Error & { status: number };
    err.status = 403;
    throw err;
  }
  const d = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!d) return null;
  return prisma.note.findMany({
    where: { dossierId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
}

export async function addNote(dossierId: string, authorId: string, content: string, opts: { admin: boolean }) {
  if (!opts.admin) {
    const err = new Error("FORBIDDEN") as Error & { status: number };
    err.status = 403;
    throw err;
  }
  const d = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!d) return null;
  return prisma.note.create({
    data: { dossierId, authorId, content },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
}
