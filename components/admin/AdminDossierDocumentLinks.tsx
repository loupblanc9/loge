"use client";

import { guarantorDocFileApiPath, tenantDocFileApiPath } from "@/lib/client/document-file-proxy";

type DocLike = { id: string; fileUrl: string | null; storagePath?: string | null };

export function AdminDossierDocumentLinks({
  dossierId,
  doc,
  guarantorId,
}: {
  dossierId: string;
  doc: DocLike;
  guarantorId?: string | null;
}) {
  const useSupabase = Boolean(doc.storagePath?.length);
  const hasFile = useSupabase || Boolean(doc.fileUrl);

  if (!hasFile) {
    return <span className="text-xs text-gray-400">Manquant</span>;
  }

  if (!useSupabase && doc.fileUrl) {
    return (
      <span className="flex gap-2">
        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-[#2563EB]">
          Voir
        </a>
        <a
          href={`${doc.fileUrl}${doc.fileUrl.includes("?") ? "&" : "?"}download=1`}
          className="text-xs text-gray-600"
        >
          Télécharger
        </a>
      </span>
    );
  }

  const viewHref = guarantorId
    ? guarantorDocFileApiPath(guarantorId, doc.id, false)
    : tenantDocFileApiPath(dossierId, doc.id, false);
  const dlHref = guarantorId
    ? guarantorDocFileApiPath(guarantorId, doc.id, true)
    : tenantDocFileApiPath(dossierId, doc.id, true);

  return (
    <span className="flex gap-2">
      <a href={viewHref} target="_blank" rel="noreferrer" className="text-xs font-medium text-[#2563EB]">
        Voir
      </a>
      <a href={dlHref} className="text-xs text-gray-600">
        Télécharger
      </a>
    </span>
  );
}
