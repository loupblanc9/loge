import type { DocumentPriority } from "@prisma/client";

export type TenantDocDef = {
  type: string;
  label: string;
  priority?: DocumentPriority;
};

/** Documents locataire — alignés maquette (identité, emploi, loyer, fiscalité, etc.) */
export const TENANT_DOCUMENT_TYPES: TenantDocDef[] = [
  { type: "ID", label: "Pièce d'identité (recto/verso)", priority: "high" },
  { type: "RIB", label: "RIB" },
  { type: "TAX", label: "Avis d'imposition (N-1)" },
  { type: "CONTRACT", label: "Contrat de travail / attestation employeur" },
  { type: "PAYSLIP", label: "Fiche de paie" },
  { type: "RENT_RECEIPT", label: "Quittance(s) de loyer" },
  { type: "ADDRESS_PROOF", label: "Justificatif de domicile" },
  { type: "OTHER", label: "Autre document" },
];

export const GUARANTOR_DOCUMENT_TYPES: TenantDocDef[] = [
  { type: "G_ID", label: "Pièce d'identité du garant", priority: "high" },
  { type: "G_TAX", label: "Avis d'imposition du garant (N-1)" },
  { type: "G_CONTRACT", label: "Contrat de travail du garant" },
  { type: "G_OTHER", label: "Autre document garant" },
];

export function labelForType(type: string): string {
  const t = TENANT_DOCUMENT_TYPES.find((d) => d.type === type);
  if (t) return t.label;
  const g = GUARANTOR_DOCUMENT_TYPES.find((d) => d.type === type);
  return g?.label ?? type;
}
