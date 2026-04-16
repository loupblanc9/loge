export type UserRole = "client" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
};

export type DossierStatus = "incomplete" | "review" | "complete";

export type DocumentStatus = "missing" | "uploaded" | "approved" | "rejected";

export type DossierListItem = {
  id: string;
  reference: string;
  title: string;
  dossierType?: "social" | "prive";
  status: DossierStatus;
  progress: number;
  isOpened: boolean;
  openedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
  tags: { id: string; name: string; color: string }[];
  documentsStats: {
    approved: number;
    total: number;
    missing: number;
    ratioLabel: string;
    hasMissing: boolean;
  };
};

export type DossiersListResponse = {
  data: DossierListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type DossierDocument = {
  id: string;
  dossierId: string;
  type: string;
  fileUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  status: DocumentStatus;
  priority: "normal" | "high";
  createdAt: string;
  updatedAt: string;
};

export type GuarantorWithDocs = {
  id: string;
  dossierId: string;
  name: string | null;
  createdAt: string;
  documents: DossierDocument[];
};

export type Note = {
  id: string;
  dossierId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; email: string };
};

export type DossierDetail = {
  id: string;
  reference: string;
  title: string;
  dossierType?: "social" | "prive";
  userId: string;
  status: DossierStatus;
  progress: number;
  isOpened: boolean;
  openedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; name: string; avatarUrl: string | null };
  documents: DossierDocument[];
  guarantors: GuarantorWithDocs[];
  dossierTags: { id: string; tagId: string; dossierId: string; tag: Tag }[];
  notes?: Note[];
  missingSummary?: string;
  missingCount?: number;
  missingLabels?: string[];
};
