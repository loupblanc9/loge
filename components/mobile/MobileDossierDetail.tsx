"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SessionUser, DossierDocument, GuarantorWithDocs } from "@/types/api";
import {
  useAddNote,
  useBulkDocs,
  useDossier,
  useMarkDossierOpen,
  useNotes,
  usePatchDocument,
  usePatchGuarantorDocument,
  useUploadGuarantorDoc,
  useUploadTenantDoc,
} from "@/hooks/queries";
import { dossierStatusUi, documentStatusUi } from "@/lib/dossier-status-ui";
import { labelForType, PRIVATE_DOCUMENT_TYPES, SOCIAL_DOCUMENT_TYPES } from "@/lib/constants/document-types";
import { formatDateTimeFr } from "@/lib/format";

type SectionKey = "infos" | "tenant" | "guarantor" | "notes";

export function MobileDossierDetail({ dossierId, user }: { dossierId: string; user: SessionUser }) {
  const { data, isLoading, refetch } = useDossier(dossierId);
  const markOpen = useMarkDossierOpen();
  const openedRef = useRef(false);
  const admin = user.role === "admin";

  const uploadTenant = useUploadTenantDoc(dossierId);
  const patchTenant = usePatchDocument(dossierId);
  const uploadGuarantor = useUploadGuarantorDoc(dossierId);
  const patchGuarantor = usePatchGuarantorDocument(dossierId);
  const bulk = useBulkDocs(dossierId);
  const notesQ = useNotes(dossierId, admin);
  const addNote = useAddNote(dossierId);
  const [note, setNote] = useState("");

  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    infos: true,
    tenant: true,
    guarantor: true,
    notes: false,
  });

  useEffect(() => {
    if (!dossierId || openedRef.current) return;
    openedRef.current = true;
    markOpen.mutate(dossierId);
  }, [dossierId, markOpen]);

  const dossier = data?.dossier;
  const st = dossier ? dossierStatusUi(dossier.status, dossier.progress) : null;

  const docLists = useMemo(() => {
    if (!dossier) return { tenant: [] as DossierDocument[], guarantors: [] as GuarantorWithDocs[] };
    return { tenant: dossier.documents, guarantors: dossier.guarantors };
  }, [dossier]);

  const counts = useMemo(() => {
    if (!dossier) return { sent: 0, total: 0, missing: 0 };
    const all = [
      ...dossier.documents,
      ...dossier.guarantors.flatMap((g) => g.documents),
    ];
    const total = all.length;
    const missing = all.filter((d) => d.status === "missing").length;
    const sent = total - missing;
    return { sent, total, missing };
  }, [dossier]);

  const requiredMap = useMemo(() => {
    if (!dossier) return new Map<string, boolean>();
    const defs = dossier.dossierType === "social" ? SOCIAL_DOCUMENT_TYPES : PRIVATE_DOCUMENT_TYPES;
    const m = new Map<string, boolean>();
    defs.forEach((d) => m.set(d.type, !!d.required));
    return m;
  }, [dossier]);

  if (isLoading || !dossier || !st) {
    return <div className="py-10 text-center text-sm text-gray-500">Chargement…</div>;
  }

  return (
    <div className="mx-auto max-w-md pb-24">
      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-[#111827]">{dossier.reference}</div>
            <div className="mt-0.5 text-xs text-[#374151]">
              {dossier.user.name} — {formatDateTimeFr(dossier.updatedAt)}
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.className}`}>{st.label}</span>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-[#374151]">
            <span>{counts.sent} documents envoyés sur {counts.total}</span>
            <span className="font-medium text-[#111827]">{dossier.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${dossier.progress}%` }} />
          </div>
        </div>

        {counts.missing > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-medium text-[#DC2626]">
            <span>!</span>
            {counts.missing} document(s) manquant(s)
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <Accordion
          title="Informations dossier"
          open={open.infos}
          onToggle={() => setOpen((o) => ({ ...o, infos: !o.infos }))}
        >
          <InfoRow label="Type" value={dossier.dossierType === "social" ? "Logement social" : "Logement privé"} />
          <InfoRow label="Client" value={dossier.user.name} />
          <InfoRow label="Bien loué" value={dossier.title || "—"} />
        </Accordion>

        <Accordion
          title="Documents locataire"
          open={open.tenant}
          onToggle={() => setOpen((o) => ({ ...o, tenant: !o.tenant }))}
        >
          <div className="space-y-2">
            {docLists.tenant.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                required={requiredMap.get(doc.type) ?? true}
                onUpload={(file) => uploadTenant.mutate({ docId: doc.id, file }, { onSuccess: () => refetch() })}
                onApprove={() => patchTenant.mutate({ docId: doc.id, status: "approved" }, { onSuccess: () => refetch() })}
                onReject={() => patchTenant.mutate({ docId: doc.id, status: "rejected" }, { onSuccess: () => refetch() })}
                canReview={admin}
              />
            ))}
          </div>
        </Accordion>

        <Accordion
          title="Documents garant"
          open={open.guarantor}
          onToggle={() => setOpen((o) => ({ ...o, guarantor: !o.guarantor }))}
        >
          {docLists.guarantors.length === 0 ? (
            <div className="text-sm text-gray-500">Aucun garant.</div>
          ) : (
            <div className="space-y-3">
              {docLists.guarantors.map((g) => (
                <div key={g.id} className="rounded-2xl bg-[#F9FAFB] p-3">
                  <div className="mb-2 text-xs font-semibold text-[#111827]">Garant</div>
                  <div className="space-y-2">
                    {g.documents.map((doc) => (
                      <DocCard
                        key={doc.id}
                        doc={doc}
                        required={true}
                        onUpload={(file) =>
                          uploadGuarantor.mutate({ guarantorId: g.id, docId: doc.id, file }, { onSuccess: () => refetch() })
                        }
                        onApprove={() =>
                          patchGuarantor.mutate({ guarantorId: g.id, docId: doc.id, status: "approved" }, { onSuccess: () => refetch() })
                        }
                        onReject={() =>
                          patchGuarantor.mutate({ guarantorId: g.id, docId: doc.id, status: "rejected" }, { onSuccess: () => refetch() })
                        }
                        canReview={admin}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Accordion>

        {admin && (
          <Accordion
            title="Notes admin"
            open={open.notes}
            onToggle={() => setOpen((o) => ({ ...o, notes: !o.notes }))}
          >
            <div className="space-y-2">
              {(notesQ.data?.notes ?? []).map((n) => (
                <div key={n.id} className="rounded-2xl bg-[#F9FAFB] p-3 text-xs text-[#374151]">
                  <div className="font-semibold text-[#111827]">{n.author.name}</div>
                  <div className="mt-1">{n.content}</div>
                  <div className="mt-1 text-[10px] text-gray-400">{formatDateTimeFr(n.createdAt)}</div>
                </div>
              ))}
            </div>
            <textarea
              className="mt-3 w-full rounded-2xl border border-gray-200 p-3 text-sm"
              rows={2}
              placeholder="Ajouter une note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              type="button"
              className="mt-2 h-11 w-full rounded-2xl bg-[#111827] text-sm font-semibold text-white disabled:opacity-50"
              disabled={!note.trim()}
              onClick={() =>
                addNote.mutate(note.trim(), {
                  onSuccess: () => {
                    setNote("");
                    notesQ.refetch();
                  },
                })
              }
            >
              Enregistrer
            </button>
          </Accordion>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-3xl bg-white p-3 shadow-lg ring-1 ring-gray-200">
            <label className="flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-[#2563EB] text-sm font-semibold text-white">
              Ajouter un document
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const firstMissing = dossier.documents.find((d) => d.status === "missing");
                  if (firstMissing) {
                    uploadTenant.mutate({ docId: firstMissing.id, file: f }, { onSuccess: () => refetch() });
                  }
                }}
              />
            </label>

            {admin && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="h-12 rounded-2xl bg-[#16A34A] text-sm font-semibold text-white"
                  onClick={() => bulk.mutate("approveAll", { onSuccess: () => refetch() })}
                >
                  Valider
                </button>
                <button
                  type="button"
                  className="h-12 rounded-2xl bg-[#DC2626] text-sm font-semibold text-white"
                  onClick={() => bulk.mutate("rejectAllUploaded", { onSuccess: () => refetch() })}
                >
                  Refuser
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <button type="button" className="flex w-full items-center justify-between" onClick={onToggle}>
        <span className="text-sm font-semibold text-[#111827]">{title}</span>
        <span className="text-gray-400">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className="text-[#374151]">{label}</span>
      <span className="truncate font-medium text-[#111827]">{value}</span>
    </div>
  );
}

function DocCard({
  doc,
  required,
  onUpload,
  onApprove,
  onReject,
  canReview,
}: {
  doc: DossierDocument;
  required: boolean;
  onUpload: (file: File) => void;
  onApprove: () => void;
  onReject: () => void;
  canReview: boolean;
}) {
  const ui = documentStatusUi(doc.status);
  const label = labelForType(doc.type);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[#111827]">{label}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ui.className}`}>{ui.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${required ? "bg-blue-50 text-[#2563EB] ring-1 ring-blue-200" : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}>
              {required ? "Obligatoire" : "Optionnel"}
            </span>
          </div>
        </div>
        <label className="shrink-0 cursor-pointer rounded-2xl bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white">
          {doc.fileUrl ? "Remplacer" : "Ajouter"}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
          />
        </label>
      </div>

      {doc.fileName && (
        <div className="mt-2 truncate text-[11px] text-gray-500" title={doc.fileName}>
          {doc.fileName}
        </div>
      )}

      {canReview && doc.status === "uploaded" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className="h-10 rounded-2xl bg-[#16A34A] text-xs font-semibold text-white" onClick={onApprove}>
            Valider
          </button>
          <button type="button" className="h-10 rounded-2xl bg-[#DC2626] text-xs font-semibold text-white" onClick={onReject}>
            Refuser
          </button>
        </div>
      )}
    </div>
  );
}

