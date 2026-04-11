export type FilterState = {
  status: ("incomplete" | "review" | "complete")[];
  activity: ("notOpened" | "recent" | "pending")[];
  missingDocuments: boolean | null;
  dossierComplet: boolean | null;
  tagIds: string[];
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
  createdFrom: "",
  createdTo: "",
  updatedFrom: "",
  updatedTo: "",
  sort: "updatedAt:desc",
  q: "",
};
