import type { DocumentStatus } from "@/types/api";

/** Premier emplacement logique pour un envoi : manquant, sinon refusé (renvoi). */
export function firstDocSlotForUpload<T extends { id: string; status: DocumentStatus }>(docs: T[]): T | null {
  return docs.find((d) => d.status === "missing") ?? docs.find((d) => d.status === "rejected") ?? null;
}

export function canUploadDocumentStatus(status: DocumentStatus): boolean {
  return status === "missing" || status === "rejected";
}
