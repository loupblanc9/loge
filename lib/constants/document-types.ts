import type { DocumentPriority } from "@prisma/client";

export type TenantDocDef = {
  type: string;
  label: string;
  priority?: DocumentPriority;
  required?: boolean;
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

/** Mobile onboarding — dossier Logement Social */
export const SOCIAL_DOCUMENT_TYPES: TenantDocDef[] = [
  { type: "SOC_NUMERO_UNIQUE", label: "Numéro unique", required: true, priority: "high" },
  { type: "SOC_ID_OR_VISA", label: "CNI ou visa", required: true, priority: "high" },
  { type: "SOC_CONTRACT", label: "Contrat de travail", required: true },
  { type: "SOC_PAYSLIP", label: "Fiche de paie", required: true },
  { type: "SOC_UTILITY_BILL", label: "Facture téléphone / EDF", required: true },
  { type: "SOC_RENT_RECEIPT", label: "Quittance de loyer", required: true },
  { type: "SOC_HOSTING_CERT", label: "Attestation d'hébergement", required: false },
  { type: "SOC_OCCUPANTS_ID", label: "Carte d'identité des occupants majeurs", required: false },
  { type: "SOC_TAX_LAST", label: "Dernier avis d'imposition", required: true },
  { type: "SOC_DIVORCE_JUDGMENT", label: "Jugement de divorce (si concerné)", required: false },
  { type: "SOC_SHARED_CUSTODY", label: "Preuve garde alternée (si concerné)", required: false },
  { type: "SOC_DALO", label: "Document DALO (si prioritaire)", required: false },
];

/** Mobile onboarding — dossier Logement Privé */
export const PRIVATE_DOCUMENT_TYPES: TenantDocDef[] = [
  { type: "PRI_ID_OR_VISA", label: "Carte d'identité / Visa", required: true, priority: "high" },
  { type: "PRI_RIB", label: "RIB", required: true },
  { type: "PRI_TAX", label: "Avis d'imposition", required: true },
  { type: "PRI_RENT_RECEIPTS_3", label: "3 dernières quittances de loyer", required: false },
  { type: "PRI_HOSTING_OR_RENT", label: "Attestation d'hébergement + facture (si besoin)", required: false },
  { type: "PRI_PAYSLIPS_3", label: "3 dernières fiches de paie", required: true },
  { type: "PRI_VISAL_PROOF", label: "Garantie Visale + preuve", required: false },
  { type: "PRI_GUARANTOR_DOCS", label: "Documents du garant", required: false },
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
  const s = SOCIAL_DOCUMENT_TYPES.find((d) => d.type === type);
  if (s) return s.label;
  const p = PRIVATE_DOCUMENT_TYPES.find((d) => d.type === type);
  if (p) return p.label;
  const g = GUARANTOR_DOCUMENT_TYPES.find((d) => d.type === type);
  return g?.label ?? type;
}
