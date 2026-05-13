"use client";

import { useState } from "react";
import type { DossierDocument } from "@/types/api";
import { guarantorDocFileApiPath, tenantDocFileApiPath } from "@/lib/client/document-file-proxy";

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

  const useSupabase = Boolean(doc.storagePath?.length);
  const hasFile = doc.status !== "missing" && (Boolean(doc.fileUrl) || useSupabase);
  const legacyUrl = doc.fileUrl ?? undefined;

  /** Même origine : session cookie envoyée (iframe / img / lien), pas d’URL signée au navigateur. */
  const fileInlineUrl = useSupabase
    ? guarantorId
      ? guarantorDocFileApiPath(guarantorId, docId, false)
      : tenantDocFileApiPath(dossierId, docId, false)
    : null;
  const fileDownloadUrl = useSupabase
    ? guarantorId
      ? guarantorDocFileApiPath(guarantorId, docId, true)
      : tenantDocFileApiPath(dossierId, docId, true)
    : null;

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
        {useSupabase && fileDownloadUrl ? (
          <a
            href={fileDownloadUrl}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#374151] hover:bg-gray-50"
          >
            Télécharger
          </a>
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
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
              <span className="truncate text-sm font-medium text-[#111827]">{doc.fileName ?? "Document"}</span>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                onClick={() => setPreviewOpen(false)}
              >
                Fermer
              </button>
            </div>
            <div className="max-h-[calc(90vh-3rem)] overflow-auto bg-gray-50 p-2">
              {useSupabase && fileInlineUrl && isPdf(doc.mimeType, doc.fileName) && (
                <iframe title="Aperçu PDF" src={fileInlineUrl} className="h-[75vh] w-full rounded-lg border-0 bg-white" />
              )}
              {useSupabase && fileInlineUrl && isImage(doc.mimeType, doc.fileName) && !isPdf(doc.mimeType, doc.fileName) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileInlineUrl} alt="" className="mx-auto max-h-[75vh] w-auto rounded-lg object-contain" />
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
                fileInlineUrl &&
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
