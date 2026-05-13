"use client";

import { useState } from "react";
import { fetchDocumentSignedUrl } from "@/lib/client/fetch-document-signed-url";

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
  const [busy, setBusy] = useState(false);
  const useSupabase = Boolean(doc.storagePath?.length);
  const hasFile = useSupabase || Boolean(doc.fileUrl);

  async function openSigned(download: boolean) {
    setBusy(true);
    try {
      const { signedUrl } = await fetchDocumentSignedUrl({ dossierId, docId: doc.id, guarantorId }, download);
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

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

  return (
    <span className="flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => openSigned(false)}
        className="text-xs font-medium text-[#2563EB] disabled:opacity-50"
      >
        Voir
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => openSigned(true)}
        className="text-xs text-gray-600 disabled:opacity-50"
      >
        Télécharger
      </button>
    </span>
  );
}
