"use client";

import { useEffect, useState, type MouseEvent } from "react";
import type { DossierDocument } from "@/types/api";
import { fetchDocumentSignedUrl } from "@/lib/client/fetch-document-signed-url";

function downloadUrlLocal(fileUrl: string): string {
  const sep = fileUrl.includes("?") ? "&" : "?";
  return `${fileUrl}${sep}download=1`;
}

function isPdf(mime: string | null | undefined, name: string | null | undefined) {
  if (mime?.includes("pdf")) return true;
  return !!name?.toLowerCase().endsWith(".pdf");
}

function isImage(mime: string | null | undefined, name: string | null | undefined) {
  if (mime?.startsWith("image/")) return true;
  return !!name?.match(/\.(jpe?g|png)$/i);
}

type DocPick = Pick<DossierDocument, "fileUrl" | "fileName" | "mimeType" | "status" | "storagePath">;

export function DocumentFileActions({
  dossierId,
  docId,
  guarantorId,
  doc,
}: {
  dossierId: string;
  docId: string;
  guarantorId?: string | null;
  doc: DocPick;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [previewErr, setPreviewErr] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const useSupabase = Boolean(doc.storagePath?.length);
  const hasFile = doc.status !== "missing" && (Boolean(doc.fileUrl) || useSupabase);
  const legacyUrl = doc.fileUrl ?? undefined;

  useEffect(() => {
    if (!previewOpen || !useSupabase) {
      if (!previewOpen) {
        setSignedUrl(null);
        setPreviewErr(null);
        setPreviewLoading(false);
      }
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewErr(null);
    setSignedUrl(null);

    fetchDocumentSignedUrl({ dossierId, docId, guarantorId }, false)
      .then(({ signedUrl: u }) => {
        if (!cancelled) setSignedUrl(u);
      })
      .catch((e: unknown) => {
        if (!cancelled) setPreviewErr(e instanceof Error ? e.message : "Erreur");
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [previewOpen, useSupabase, dossierId, docId, guarantorId]);

  const closePreview = () => {
    setPreviewOpen(false);
    setSignedUrl(null);
    setPreviewErr(null);
  };

  const handleDownloadSupabase = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const { signedUrl: u } = await fetchDocumentSignedUrl({ dossierId, docId, guarantorId }, true);
      window.open(u, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      window.alert(err instanceof Error ? err.message : "Téléchargement impossible");
    }
  };

  if (!hasFile) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:bg-blue-50"
        >
          Voir
        </button>
        {useSupabase ? (
          <button
            type="button"
            onClick={handleDownloadSupabase}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#374151] hover:bg-gray-50"
          >
            Télécharger
          </button>
        ) : (
          legacyUrl && (
            <a
              href={downloadUrlLocal(legacyUrl)}
              download={doc.fileName ?? "document"}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#374151] hover:bg-gray-50"
            >
              Télécharger
            </a>
          )
        )}
      </div>

      {previewOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          onClick={closePreview}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
              <span className="truncate text-sm font-medium text-[#111827]">{doc.fileName ?? "Document"}</span>
              <button type="button" className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100" onClick={closePreview}>
                Fermer
              </button>
            </div>
            <div className="max-h-[calc(90vh-3rem)] overflow-auto bg-gray-50 p-2">
              {useSupabase && previewLoading && (
                <p className="p-8 text-center text-sm text-gray-600">Chargement de l’aperçu…</p>
              )}
              {useSupabase && previewErr && !previewLoading && (
                <p className="p-8 text-center text-sm text-[#DC2626]">{previewErr}</p>
              )}
              {useSupabase && signedUrl && isPdf(doc.mimeType, doc.fileName) && (
                <iframe title="Aperçu PDF" src={signedUrl} className="h-[75vh] w-full rounded-lg border-0 bg-white" />
              )}
              {useSupabase && signedUrl && isImage(doc.mimeType, doc.fileName) && !isPdf(doc.mimeType, doc.fileName) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={signedUrl} alt="" className="mx-auto max-h-[75vh] w-auto rounded-lg object-contain" />
              )}
              {!useSupabase && legacyUrl && isPdf(doc.mimeType, doc.fileName) && (
                <iframe title="Aperçu PDF" src={legacyUrl} className="h-[75vh] w-full rounded-lg border-0 bg-white" />
              )}
              {!useSupabase && legacyUrl && isImage(doc.mimeType, doc.fileName) && !isPdf(doc.mimeType, doc.fileName) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={legacyUrl} alt="" className="mx-auto max-h-[75vh] w-auto rounded-lg object-contain" />
              )}
              {!useSupabase && legacyUrl && !isPdf(doc.mimeType, doc.fileName) && !isImage(doc.mimeType, doc.fileName) && (
                <p className="p-8 text-center text-sm text-gray-600">
                  Prévisualisation non disponible. Utilisez « Télécharger » ou{" "}
                  <a href={legacyUrl} target="_blank" rel="noreferrer" className="font-medium text-[#2563EB] underline">
                    ouvrir dans un nouvel onglet
                  </a>
                  .
                </p>
              )}
              {useSupabase &&
                signedUrl &&
                !isPdf(doc.mimeType, doc.fileName) &&
                !isImage(doc.mimeType, doc.fileName) && (
                  <p className="p-8 text-center text-sm text-gray-600">
                    Prévisualisation non disponible pour ce format. Utilisez « Télécharger ».
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
