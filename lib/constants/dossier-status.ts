import type { DossierStatus } from "@prisma/client";
import { z } from "zod";

/** Ordre d’affichage filtres / selects admin */
export const DOSSIER_STATUS_ORDER: DossierStatus[] = [
  "pending",
  "incomplete",
  "in_review",
  "validated",
  "rejected",
];

export const dossierStatusLabelFr: Record<DossierStatus, string> = {
  pending: "En attente",
  incomplete: "Incomplet",
  in_review: "En vérification",
  validated: "Validé",
  rejected: "Refusé",
};

export const zDossierStatus = z.enum(
  ["pending", "incomplete", "in_review", "validated", "rejected"] as const,
);
