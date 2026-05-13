/** Chemins API (same-origin) pour obtenir une URL signée Supabase Storage. */
export function documentSignedUrlPath(
  opts: { dossierId: string; docId: string; guarantorId?: string | null },
  download: boolean,
): string {
  const q = download ? "?download=1" : "?download=0";
  if (opts.guarantorId) {
    return `/api/guarantors/${opts.guarantorId}/documents/${opts.docId}/signed-url${q}`;
  }
  return `/api/dossiers/${opts.dossierId}/documents/${opts.docId}/signed-url${q}`;
}
