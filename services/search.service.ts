import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dossierListInclude, serializeDossierForTable } from "@/services/dossier-metadata.service";

/** Recherche globale indexée (référence, email, nom) — résultats légers pour autocomplete / table */
export async function globalSearch(
  q: string,
  opts: { userId?: string; admin: boolean; limit?: number },
) {
  const term = q.trim();
  if (term.length < 2) {
    return { data: [] as ReturnType<typeof serializeDossierForTable>[] };
  }

  const limit = Math.min(opts.limit ?? 15, 50);
  if (!opts.admin && !opts.userId) {
    throw new Error("userId requis pour la recherche client");
  }
  const access: Prisma.DossierWhereInput = opts.admin ? {} : { userId: opts.userId! };

  const rows = await prisma.dossier.findMany({
    where: {
      ...access,
      OR: [
        { reference: { contains: term, mode: "insensitive" } },
        { title: { contains: term, mode: "insensitive" } },
        { user: { email: { contains: term, mode: "insensitive" } } },
        { user: { name: { contains: term, mode: "insensitive" } } },
      ],
    },
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: dossierListInclude,
  });

  return { data: rows.map(serializeDossierForTable) };
}
