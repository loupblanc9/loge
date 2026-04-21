"use client";

import { useState } from "react";
import type { DossierDocument } from "@/types/api";

function downloadUrl(fileUrl: string): string {
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

export function DocumentFileActions({ doc }: { doc: Pick<DossierDocument, "fileUrl" | "fileName" | "mimeType" | "status"> }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!doc.fileUrl || doc.status === "missing") return null;

  const openPreview = () => setPreviewOpen(true);

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={openPreview}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:bg-blue-50"
        >
          Voir
        </button>
        <a
          href={downloadUrl(doc.fileUrl)}
          download={doc.fileName ?? "document"}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-[#374151] hover:bg-gray-50"
        >
          Télécharger
        </a>
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
              {isPdf(doc.mimeType, doc.fileName) && (
                <iframe title="Aperçu PDF" src={doc.fileUrl} className="h-[75vh] w-full rounded-lg border-0 bg-white" />
              )}
              {isImage(doc.mimeType, doc.fileName) && !isPdf(doc.mimeType, doc.fileName) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.fileUrl} alt="" className="mx-auto max-h-[75vh] w-auto rounded-lg object-contain" />
              )}
              {!isPdf(doc.mimeType, doc.fileName) && !isImage(doc.mimeType, doc.fileName) && (
                <p className="p-8 text-center text-sm text-gray-600">
                  Prévisualisation non disponible. Utilisez « Télécharger » ou{' '}
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-[#2563EB] underline">
                    ouvrir dans un nouvel onglet
                  </a>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
