/** Flux fichier authentifié (même origine) — le serveur lit Supabase puis renvoie le corps (iframe / img / téléchargement fiable sur mobile). */

export function tenantDocFileApiPath(dossierId: string, docId: string, download: boolean): string {
  return `/api/dossiers/${dossierId}/documents/${docId}/file${download ? "?download=1" : ""}`;
}

export function guarantorDocFileApiPath(guarantorId: string, docId: string, download: boolean): string {
  return `/api/guarantors/${guarantorId}/documents/${docId}/file${download ? "?download=1" : ""}`;
}
