"use client";

import { useState, useRef, useEffect } from "react";
import { useTags } from "@/hooks/queries";
import { defaultFilterState, type FilterState } from "@/types/filters";
import { DOSSIER_STATUS_ORDER, dossierStatusLabelFr } from "@/lib/constants/dossier-status";

export type { FilterState } from "@/types/filters";
export { defaultFilterState } from "@/types/filters";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, enabled: boolean) {
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onOutside();
    }
    if (enabled) {
      document.addEventListener("click", onDoc);
      return () => document.removeEventListener("click", onDoc);
    }
  }, [ref, onOutside, enabled]);
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#374151]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded border-gray-300" />
      {label}
    </label>
  );
}

function Dropdown({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => open && onToggle(), open);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-[#374151] hover:border-[#2563EB]/40 hover:bg-[#F9FAFB]"
      >
        {label}
        <span className="text-gray-400">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[240px] rounded-xl border border-gray-200 bg-white p-3 shadow-xl">{children}</div>
      )}
    </div>
  );
}

export function AdvancedFilters({
  state,
  onApply,
  onReset,
}: {
  state: FilterState;
  onApply: (f: FilterState) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<FilterState>(state);
  const [open, setOpen] = useState<string | null>(null);
  const { data: tagsData } = useTags();

  useEffect(() => {
    setDraft(state);
  }, [state]);

  const apply = () => {
    onApply(draft);
    setOpen(null);
  };

  const reset = () => {
    setDraft(defaultFilterState);
    onReset();
    setOpen(null);
  };

  return (
    <div className="relative flex flex-wrap items-center gap-2 border-l border-gray-200 pl-4">
      <Dropdown label="Statut" open={open === "s"} onToggle={() => setOpen((k) => (k === "s" ? null : "s"))}>
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {DOSSIER_STATUS_ORDER.map((v) => (
            <Toggle
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
        </div>
      </Dropdown>

      <Dropdown label="Type" open={open === "ty"} onToggle={() => setOpen((k) => (k === "ty" ? null : "ty"))}>
        <div className="flex flex-col gap-2">
          {(
            [
              ["social", "Social"],
              ["prive", "Privé"],
            ] as const
          ).map(([v, label]) => (
            <Toggle
              key={v}
              label={label}
              checked={draft.dossierType.includes(v)}
              onChange={(c) =>
                setDraft((d) => ({
                  ...d,
                  dossierType: c ? [...d.dossierType, v] : d.dossierType.filter((x) => x !== v),
                }))
              }
            />
          ))}
        </div>
      </Dropdown>

      <Dropdown label="Progression" open={open === "pr"} onToggle={() => setOpen((k) => (k === "pr" ? null : "pr"))}>
        <div className="flex flex-col gap-2 text-sm">
          <button
            type="button"
            className="rounded-lg border border-gray-100 px-2 py-1.5 text-left hover:bg-gray-50"
            onClick={() => setDraft((d) => ({ ...d, progressMin: "", progressMax: "" }))}
          >
            Toutes progressions
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-100 px-2 py-1.5 text-left hover:bg-gray-50"
            onClick={() => setDraft((d) => ({ ...d, progressMin: "0", progressMax: "25" }))}
          >
            0 % – 25 %
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-100 px-2 py-1.5 text-left hover:bg-gray-50"
            onClick={() => setDraft((d) => ({ ...d, progressMin: "26", progressMax: "75" }))}
          >
            26 % – 75 %
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-100 px-2 py-1.5 text-left hover:bg-gray-50"
            onClick={() => setDraft((d) => ({ ...d, progressMin: "76", progressMax: "100" }))}
          >
            76 % – 100 %
          </button>
        </div>
      </Dropdown>

      <Dropdown label="Activité" open={open === "a"} onToggle={() => setOpen((k) => (k === "a" ? null : "a"))}>
        <div className="flex flex-col gap-2">
          {(
            [
              ["notOpened", "Non ouvert"],
              ["recent", "Récent"],
              ["pending", "En vérification (file)"],
            ] as const
          ).map(([v, label]) => (
            <Toggle
              key={v}
              label={label}
              checked={draft.activity.includes(v)}
              onChange={(c) =>
                setDraft((d) => ({
                  ...d,
                  activity: c ? [...d.activity, v] : d.activity.filter((x) => x !== v),
                }))
              }
            />
          ))}
        </div>
      </Dropdown>

      <Dropdown label="Documents" open={open === "d"} onToggle={() => setOpen((k) => (k === "d" ? null : "d"))}>
        <div className="flex flex-col gap-2">
          <Toggle
            label="Documents manquants"
            checked={draft.missingDocuments === true}
            onChange={(c) => setDraft((d) => ({ ...d, missingDocuments: c ? true : null }))}
          />
          <Toggle
            label="Dossier complet"
            checked={draft.dossierComplet === true}
            onChange={(c) => setDraft((d) => ({ ...d, dossierComplet: c ? true : null }))}
          />
        </div>
      </Dropdown>

      <Dropdown label="Tags" open={open === "t"} onToggle={() => setOpen((k) => (k === "t" ? null : "t"))}>
        <div className="flex max-h-48 max-w-xs flex-wrap gap-2 overflow-y-auto">
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
                className="rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-gray-200"
                style={{ backgroundColor: `${t.color}22` }}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </Dropdown>

      <Dropdown label="Dates" open={open === "dt"} onToggle={() => setOpen((k) => (k === "dt" ? null : "dt"))}>
        <div className="grid w-72 gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium uppercase text-gray-500">Création du</label>
              <input
                type="date"
                className="mt-0.5 w-full rounded-lg border border-gray-200 px-2 py-1 text-xs"
                value={draft.createdFrom}
                onChange={(e) => setDraft((d) => ({ ...d, createdFrom: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase text-gray-500">Création au</label>
              <input
                type="date"
                className="mt-0.5 w-full rounded-lg border border-gray-200 px-2 py-1 text-xs"
                value={draft.createdTo}
                onChange={(e) => setDraft((d) => ({ ...d, createdTo: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium uppercase text-gray-500">Modif. du</label>
              <input
                type="date"
                className="mt-0.5 w-full rounded-lg border border-gray-200 px-2 py-1 text-xs"
                value={draft.updatedFrom}
                onChange={(e) => setDraft((d) => ({ ...d, updatedFrom: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase text-gray-500">Modif. au</label>
              <input
                type="date"
                className="mt-0.5 w-full rounded-lg border border-gray-200 px-2 py-1 text-xs"
                value={draft.updatedTo}
                onChange={(e) => setDraft((d) => ({ ...d, updatedTo: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </Dropdown>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-gray-50"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={apply}
          className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}
