"use client";

import { useState, useEffect } from "react";
import type { FilterState } from "@/types/filters";
import { useTags } from "@/hooks/queries";
import { DOSSIER_STATUS_ORDER, dossierStatusLabelFr } from "@/lib/constants/dossier-status";

export function MobileFiltersSheet({
  open,
  onClose,
  state,
  onApply,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  state: FilterState;
  onApply: (f: FilterState) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<FilterState>(state);
  const { data: tagsData } = useTags();

  useEffect(() => setDraft(state), [state]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-black/40">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#111827]">Filtres avancés</h2>
          <button type="button" className="text-sm text-gray-500" onClick={onClose}>
            ✕
          </button>
        </div>

        <Section title="Statut dossier">
          {DOSSIER_STATUS_ORDER.map((v) => (
            <Check
              key={v}
              label={dossierStatusLabelFr[v]}
              checked={draft.status.includes(v)}
              onChange={(c) =>
                setDraft((d) => ({
                  ...d,
                  status: c ? [...d.status, v] : d.status.filter((x) => x !== v),
                }))
              }
            />
          ))}
        </Section>

        <Section title="Type de dossier">
          <Check
            label="Social"
            checked={draft.dossierType.includes("social")}
            onChange={(c) =>
              setDraft((d) => ({
                ...d,
                dossierType: c ? [...d.dossierType, "social"] : d.dossierType.filter((x) => x !== "social"),
              }))
            }
          />
          <Check
            label="Privé"
            checked={draft.dossierType.includes("prive")}
            onChange={(c) =>
              setDraft((d) => ({
                ...d,
                dossierType: c ? [...d.dossierType, "prive"] : d.dossierType.filter((x) => x !== "prive"),
              }))
            }
          />
        </Section>

        <Section title="Progression">
          <div className="flex flex-col gap-2">
            <PresetBtn
              label="Toutes"
              onClick={() => setDraft((d) => ({ ...d, progressMin: "", progressMax: "" }))}
            />
            <PresetBtn label="0 – 25 %" onClick={() => setDraft((d) => ({ ...d, progressMin: "0", progressMax: "25" }))} />
            <PresetBtn
              label="26 – 75 %"
              onClick={() => setDraft((d) => ({ ...d, progressMin: "26", progressMax: "75" }))}
            />
            <PresetBtn
              label="76 – 100 %"
              onClick={() => setDraft((d) => ({ ...d, progressMin: "76", progressMax: "100" }))}
            />
          </div>
        </Section>

        <Section title="Activité">
          <Check
            label="Récent"
            checked={draft.activity.includes("recent")}
            onChange={(c) =>
              setDraft((d) => ({
                ...d,
                activity: c ? [...d.activity, "recent"] : d.activity.filter((x) => x !== "recent"),
              }))
            }
          />
          <Check
            label="Non ouvert"
            checked={draft.activity.includes("notOpened")}
            onChange={(c) =>
              setDraft((d) => ({
                ...d,
                activity: c ? [...d.activity, "notOpened"] : d.activity.filter((x) => x !== "notOpened"),
              }))
            }
          />
          <Check
            label="En vérification (file)"
            checked={draft.activity.includes("pending")}
            onChange={(c) =>
              setDraft((d) => ({
                ...d,
                activity: c ? [...d.activity, "pending"] : d.activity.filter((x) => x !== "pending"),
              }))
            }
          />
        </Section>

        <Section title="Documents">
          <Check
            label="Manquants"
            checked={draft.missingDocuments === true}
            onChange={(c) => setDraft((d) => ({ ...d, missingDocuments: c ? true : null }))}
          />
          <Check
            label="Complétés"
            checked={draft.dossierComplet === true}
            onChange={(c) => setDraft((d) => ({ ...d, dossierComplet: c ? true : null }))}
          />
        </Section>

        <Section title="Tags">
          <div className="flex flex-wrap gap-2">
            {tagsData?.tags.map((t) => {
              const on = draft.tagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      tagIds: on ? d.tagIds.filter((x) => x !== t.id) : [...d.tagIds, t.id],
                    }))
                  }
                  className="rounded-full px-3 py-1 text-xs font-medium ring-1 ring-gray-200"
                  style={{ backgroundColor: `${t.color}22` }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </Section>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="h-11 flex-1 rounded-2xl border border-gray-200 text-sm font-medium text-[#374151]"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="h-11 flex-1 rounded-2xl bg-[#2563EB] text-sm font-semibold text-white"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}

function PresetBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-gray-200 px-3 py-2 text-left text-sm text-[#374151] hover:bg-gray-50"
    >
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-sm font-semibold text-[#111827]">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 text-sm text-[#374151]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
      {label}
    </label>
  );
}
