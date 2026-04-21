import type { DossierStatus } from "@/types/api";

export type FilterState = {
  status: DossierStatus[];
  /** Filtre activité : « pending » = dossiers en statut en_vérification (`in_review`) */
  activity: ("notOpened" | "recent" | "pending")[];
  missingDocuments: boolean | null;
  dossierComplet: boolean | null;
  tagIds: string[];
  dossierType: ("social" | "prive")[];
  /** Pourcentage min (0–100), chaîne vide = sans filtre */
  progressMin: string;
  progressMax: string;
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
  sort: string;
  q: string;
};

export const defaultFilterState: FilterState = {
  status: [],
  activity: [],
  missingDocuments: null,
  dossierComplet: null,
  tagIds: [],
  dossierType: [],
  progressMin: "",
  progressMax: "",
  createdFrom: "",
  createdTo: "",
  updatedFrom: "",
  updatedTo: "",
  sort: "updatedAt:desc",
  q: "",
};
