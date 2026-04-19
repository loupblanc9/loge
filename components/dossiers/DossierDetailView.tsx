"use client";

import { useEffect, useRef, useState } from "react";
import type { SessionUser, DossierDocument } from "@/types/api";
import {
  useDossier,
  useMarkDossierOpen,
  usePatchDocument,
  usePatchGuarantorDocument,
  useUploadTenantDoc,
  useUploadGuarantorDoc,
  useBulkDocs,
  useNotes,
  useAddNote,
  useCreateGuarantor,
} from "@/hooks/queries";
import { labelForType } from "@/lib/constants/document-types";
import { dossierStatusUi, documentStatusUi } from "@/lib/dossier-status-ui";
import { formatDateTimeFr } from "@/lib/format";
import { canUploadDocumentStatus, firstDocSlotForUpload } from "@/lib/upload-slot";
import { TagBadges } from "./TagBadges";
import { TagPickerModal } from "./TagPickerModal";

function DocThumb({ url, name }: { url: string | null; name: string | null }) {
  if (!url) return <div className="h-12 w-16 shrink-0 rounded border border-dashed border-gray-200 bg-gray-50" />;
  const isImg = url.match(/\.(jpg|jpeg|png)$/i) || name?.match(/\.(jpg|jpeg|png)$/i);
  if (isImg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="h-12 w-16 rounded border object-cover" />
    );
  }
  return (
    <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded border bg-gray-100 text-[10px] text-gray-500">
      PDF
    </div>
  );
}

export function DossierDetailView({
  dossierId,
  session,
  compact = false,
}: {
  dossierId: string;
  session: SessionUser;
  compact?: boolean;
}) {
  const { data, isLoading, refetch } = useDossier(dossierId);
  const markOpen = useMarkDossierOpen();
  const openedRef = useRef(false);
  const [tab, setTab] = useState<"tenant" | "guarantor">("tenant");
  const [tagOpen, setTagOpen] = useState(false);
  const [note, setNote] = useState("");
  const admin = session.role === "admin";

  const dossier = data?.dossier;
  const bulk = useBulkDocs(dossierId);
  const createG = useCreateGuarantor(dossierId);
  const notesQ = useNotes(dossierId, admin);
  const addNote = useAddNote(dossierId);

  useEffect(() => {
    if (!dossierId || openedRef.current) return;
    openedRef.current = true;
    markOpen.mutate(dossierId);
  }, [dossierId, markOpen]);

  if (isLoading || !dossier) {
    return <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500">Chargement…</div>;
  }

  const st = dossierStatusUi(dossier.status, dossier.progress);
  const tags = dossier.dossierTags.map((dt) => ({ id: dt.tag.id, name: dt.tag.name, color: dt.tag.color }));

  const missingTenant = dossier.documents.filter((d) => d.status === "missing");
  const missingGuarantor = dossier.guarantors.flatMap((g) => g.documents.filter((d) => d.status === "missing"));

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#111827]">{dossier.reference}</h1>
            <p className="text-sm text-[#374151]">
              Client : <span className="font-medium text-[#111827]">{dossier.user.name}</span>
            </p>
            {dossier.title ? <p className="mt-1 text-sm text-[#374151]">{dossier.title}</p> : null}
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${st.className}`}>
            {st.label}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TagBadges tags={tags} onAdd={admin || session.id === dossier.userId ? () => setTagOpen(true) : undefined} />
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-medium text-[#374151]">
            <span>Progression</span>
            <span>{dossier.progress}% complété</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${dossier.progress}%` }} />
          </div>
        </div>
      </header>

      {(dossier.missingCount ?? 0) > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Documents manquants :</strong> {dossier.missingSummary}
          {dossier.missingLabels?.length ? (
            <span className="block text-xs opacity-90">({dossier.missingLabels.join(", ")})</span>
          ) : null}
        </div>
      )}

      <div className={`grid gap-4 ${compact ? "" : "lg:grid-cols-[minmax(0,280px)_1fr]"}`}>
        <div className="space-y-4">
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#111827]">Documents manquants</h2>
            <ul className="mt-2 space-y-2">
              {[...missingTenant, ...missingGuarantor].slice(0, 8).map((doc) => (
                <li key={doc.id} className="flex items-start gap-2 text-sm text-[#374151]">
                  <span className="text-[#DC2626]">!</span>
                  <span>
                    {labelForType(doc.type)}
                    {doc.priority === "high" && (
                      <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                        Priorité haute
                      </span>
                    )}
                  </span>
                </li>
              ))}
              {missingTenant.length + missingGuarantor.length === 0 && (
                <li className="text-sm text-emerald-600">Aucun document manquant</li>
              )}
            </ul>
          </section>

          {admin && (
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[#111827]">Actions</h2>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => bulk.mutate("approveAll", { onSuccess: () => refetch() })}
                  className="rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  Valider tous les documents
                </button>
                <button
                  type="button"
                  onClick={() => bulk.mutate("rejectAllUploaded", { onSuccess: () => refetch() })}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-[#DC2626]"
                >
                  Refuser tous les documents
                </button>
                <button
                  type="button"
                  onClick={() => createG.mutate({}, { onSuccess: () => refetch() })}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#2563EB]"
                >
                  + Ajouter un garant
                </button>
              </div>
            </section>
          )}

          {admin && (
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[#111827]">Notes internes</h2>
              <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-xs text-[#374151]">
                {notesQ.data?.notes.map((n) => (
                  <li key={n.id} className="rounded border border-gray-100 bg-gray-50 p-2">
                    <div className="font-medium text-[#111827]">{n.author.name}</div>
                    <div>{n.content}</div>
                    <div className="text-[10px] text-gray-400">{formatDateTimeFr(n.createdAt)}</div>
                  </li>
                ))}
              </ul>
              <textarea
                className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm"
                rows={2}
                placeholder="Nouvelle note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                type="button"
                className="mt-2 rounded-lg bg-[#111827] px-3 py-1.5 text-xs font-medium text-white"
                onClick={() =>
                  addNote.mutate(note, {
                    onSuccess: () => {
                      setNote("");
                      notesQ.refetch();
                    },
                  })
                }
              >
                Enregistrer
              </button>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                tab === "tenant" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-gray-500"
              }`}
              onClick={() => setTab("tenant")}
            >
              Documents du locataire
            </button>
            <button
              type="button"
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                tab === "guarantor" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-gray-500"
              }`}
              onClick={() => setTab("guarantor")}
            >
              Documents du garant
            </button>
          </div>

          <DocumentListSection
            dossierId={dossierId}
            admin={admin}
            canUpload={admin || session.id === dossier.userId}
            documents={tab === "tenant" ? dossier.documents : []}
            guarantors={tab === "guarantor" ? dossier.guarantors : []}
            onRefresh={() => refetch()}
          />
        </div>
      </div>

      {tagOpen && (
        <TagPickerModal dossierId={dossierId} onClose={() => setTagOpen(false)} onDone={() => refetch()} />
      )}
    </div>
  );
}

function DocumentListSection({
  dossierId,
  admin,
  canUpload,
  documents,
  guarantors,
  onRefresh,
}: {
  dossierId: string;
  admin: boolean;
  canUpload: boolean;
  documents: DossierDocument[];
  guarantors: import("@/types/api").GuarantorWithDocs[];
  onRefresh: () => void;
}) {
  const patchT = usePatchDocument(dossierId);
  const uploadT = useUploadTenantDoc(dossierId);
  const [tenantUploadOkId, setTenantUploadOkId] = useState<string | null>(null);

  if (documents.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <ul className="divide-y divide-gray-100">
          {documents.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 p-4">
              <DocThumb url={d.fileUrl} name={d.fileName} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[#111827]">{labelForType(d.type)}</div>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${documentStatusUi(d.status).className}`}>
                  {documentStatusUi(d.status).label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canUpload && canUploadDocumentStatus(d.status) && (
                  <label
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
                      uploadT.isPending && uploadT.variables?.docId === d.id ? "bg-blue-400" : "bg-[#2563EB]"
                    }`}
                  >
                    {uploadT.isPending && uploadT.variables?.docId === d.id
                      ? "Envoi…"
                      : d.status === "rejected"
                        ? "Renvoyer"
                        : "Ajouter"}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className="hidden"
                      disabled={uploadT.isPending}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        const input = e.target;
                        if (f) {
                          uploadT.mutate(
                            { docId: d.id, file: f },
                            {
                              onSuccess: () => {
                                onRefresh();
                                setTenantUploadOkId(d.id);
                                window.setTimeout(() => setTenantUploadOkId((cur) => (cur === d.id ? null : cur)), 2500);
                                input.value = "";
                              },
                              onError: () => {
                                input.value = "";
                              },
                            },
                          );
                        } else input.value = "";
                      }}
                    />
                  </label>
                )}
                {tenantUploadOkId === d.id && (
                  <span className="w-full text-xs font-medium text-[#16A34A]">Document ajouté</span>
                )}
                {uploadT.isError && uploadT.variables?.docId === d.id && (
                  <span className="w-full text-xs text-[#DC2626]">
                    {uploadT.error instanceof Error ? uploadT.error.message : "Échec de l’envoi"}
                  </span>
                )}
                {admin && d.status === "uploaded" && (
                  <>
                    <button
                      type="button"
                      className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white"
                      onClick={() => patchT.mutate({ docId: d.id, status: "approved" }, { onSuccess: onRefresh })}
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-[#DC2626]"
                      onClick={() => patchT.mutate({ docId: d.id, status: "rejected" }, { onSuccess: onRefresh })}
                    >
                      Refuser
                    </button>
                  </>
                )}
                {admin && d.status === "approved" && (
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-[#DC2626]"
                    onClick={() => patchT.mutate({ docId: d.id, status: "rejected" }, { onSuccess: onRefresh })}
                  >
                    Refuser
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <UploadZone dossierId={dossierId} onUploaded={onRefresh} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {guarantors.map((g) => (
        <GuarantorBlock key={g.id} dossierId={dossierId} g={g} admin={admin} canUpload={canUpload} onRefresh={onRefresh} />
      ))}
      {guarantors.length === 0 && (
        <p className="text-sm text-gray-500">Aucun garant. Ajoutez-en depuis le panneau Actions (admin).</p>
      )}
    </div>
  );
}

function GuarantorBlock({
  dossierId,
  g,
  admin,
  canUpload,
  onRefresh,
}: {
  dossierId: string;
  g: import("@/types/api").GuarantorWithDocs;
  admin: boolean;
  canUpload: boolean;
  onRefresh: () => void;
}) {
  const patchG = usePatchGuarantorDocument(dossierId);
  const uploadG = useUploadGuarantorDoc(dossierId);
  const [gUploadOkKey, setGUploadOkKey] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-2 text-sm font-semibold text-[#111827]">
        Garant {g.name ? `— ${g.name}` : ""}
      </div>
      <ul className="divide-y divide-gray-100">
        {g.documents.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-3 p-4">
            <DocThumb url={d.fileUrl} name={d.fileName} />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[#111827]">{labelForType(d.type)}</div>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${documentStatusUi(d.status).className}`}
              >
                {documentStatusUi(d.status).label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canUpload && canUploadDocumentStatus(d.status) && (
                <label
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
                    uploadG.isPending && uploadG.variables?.docId === d.id ? "bg-blue-400" : "bg-[#2563EB]"
                  }`}
                >
                  {uploadG.isPending && uploadG.variables?.docId === d.id
                    ? "Envoi…"
                    : d.status === "rejected"
                      ? "Renvoyer le document"
                      : "Ajouter le document"}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    className="hidden"
                    disabled={uploadG.isPending}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      const input = e.target;
                      if (f) {
                        const key = `${g.id}:${d.id}`;
                        uploadG.mutate(
                          { guarantorId: g.id, docId: d.id, file: f },
                          {
                            onSuccess: () => {
                              onRefresh();
                              setGUploadOkKey(key);
                              window.setTimeout(() => setGUploadOkKey((cur) => (cur === key ? null : cur)), 2500);
                              input.value = "";
                            },
                            onError: () => {
                              input.value = "";
                            },
                          },
                        );
                      } else input.value = "";
                    }}
                  />
                </label>
              )}
              {gUploadOkKey === `${g.id}:${d.id}` && (
                <span className="w-full text-xs font-medium text-[#16A34A]">Document ajouté</span>
              )}
              {uploadG.isError && uploadG.variables?.docId === d.id && uploadG.variables?.guarantorId === g.id && (
                <span className="w-full text-xs text-[#DC2626]">
                  {uploadG.error instanceof Error ? uploadG.error.message : "Échec de l’envoi"}
                </span>
              )}
              {admin && d.status === "uploaded" && (
                <>
                  <button
                    type="button"
                    className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white"
                    onClick={() =>
                      patchG.mutate({ guarantorId: g.id, docId: d.id, status: "approved" }, { onSuccess: onRefresh })
                    }
                  >
                    Valider
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-[#DC2626]"
                    onClick={() =>
                      patchG.mutate({ guarantorId: g.id, docId: d.id, status: "rejected" }, { onSuccess: onRefresh })
                    }
                  >
                    Refuser
                  </button>
                </>
              )}
              {admin && d.status === "approved" && (
                <button
                  type="button"
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-[#DC2626]"
                  onClick={() =>
                    patchG.mutate({ guarantorId: g.id, docId: d.id, status: "rejected" }, { onSuccess: onRefresh })
                  }
                >
                  Refuser
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UploadZone({ dossierId, onUploaded }: { dossierId: string; onUploaded: () => void }) {
  const uploadT = useUploadTenantDoc(dossierId);
  const { data } = useDossier(dossierId);
  const slot = data?.dossier.documents ? firstDocSlotForUpload(data.dossier.documents) : null;
  const [justOk, setJustOk] = useState(false);
  return (
    <div className="m-4">
      <label
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-[#F9FAFB] px-4 py-8 text-center text-sm text-[#374151] hover:bg-gray-100 ${
          uploadT.isPending ? "pointer-events-none opacity-70" : ""
        }`}
      >
        <span className="text-xl">{uploadT.isPending ? "⏳" : "☁"}</span>
        <span className="mt-2 font-medium text-[#111827]">
          {uploadT.isPending ? "Upload en cours…" : "Glisser-déposer ou cliquer"}
        </span>
        <span className="mt-1 text-xs text-[#374151]">
          {slot
            ? `Le prochain envoi remplira : ${labelForType(slot.type)}`
            : "Aucun document locataire à compléter (manquant ou refusé)."}
        </span>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          disabled={uploadT.isPending || !slot}
          onChange={(e) => {
            const f = e.target.files?.[0];
            const input = e.target;
            const current = data?.dossier.documents ? firstDocSlotForUpload(data.dossier.documents) : null;
            if (f && current) {
              uploadT.mutate(
                { docId: current.id, file: f },
                {
                  onSuccess: () => {
                    onUploaded();
                    setJustOk(true);
                    window.setTimeout(() => setJustOk(false), 2500);
                    input.value = "";
                  },
                  onError: () => {
                    input.value = "";
                  },
                },
              );
            } else input.value = "";
          }}
        />
      </label>
      {justOk && (
        <p className="mt-2 text-center text-xs font-medium text-[#16A34A]">Document ajouté</p>
      )}
      {uploadT.isError && (
        <p className="mt-2 text-center text-xs text-[#DC2626]">
          {uploadT.error instanceof Error ? uploadT.error.message : "Échec de l’envoi"}
        </p>
      )}
    </div>
  );
}
