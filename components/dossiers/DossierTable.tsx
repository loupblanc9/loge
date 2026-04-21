"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { DossierListItem } from "@/types/api";
import { useDossiersList } from "@/hooks/queries";
import { toApiListParams } from "@/lib/filter-url";
import { formatDateTimeFr } from "@/lib/format";
import { dossierStatusUi } from "@/lib/dossier-status-ui";
import { TagBadges } from "./TagBadges";
import { BulkActionsBar } from "./BulkActionsBar";
import { TagPickerModal } from "./TagPickerModal";
import { QuickRowValidate } from "./QuickRowValidate";

type Props = {
  admin: boolean;
};

function dossierTypeLabel(dt: DossierListItem["dossierType"]) {
  if (dt === "social") return "Social";
  if (dt === "prive") return "Privé";
  return "—";
}

export function DossierTable({ admin }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiQs = useMemo(() => toApiListParams(searchParams), [searchParams]);
  const { data, isLoading, isError, refetch } = useDossiersList(apiQs);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [tagFor, setTagFor] = useState<string | null>(null);
  const page = Number(searchParams.get("page") ?? 1);

  const setPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(p));
    router.push(`${window.location.pathname}?${sp.toString()}`);
  };

  const setSort = (sort: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("sort", sort);
    sp.set("page", "1");
    router.push(`${window.location.pathname}?${sp.toString()}`);
  };

  const toggleAll = (rows: DossierListItem[]) => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  };

  if (isLoading) return <div className="py-16 text-center text-sm text-gray-500">Chargement…</div>;
  if (isError || !data) return <div className="py-16 text-center text-sm text-red-600">Erreur de chargement</div>;

  const rows = data.data;
  const meta = data.meta;

  const currentSort = searchParams.get("sort") ?? "updatedAt:desc";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <label className="text-xs text-gray-500">Tri</label>
        <select
          value={currentSort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm"
        >
          <option value="updatedAt:desc">Dernière mise à jour</option>
          <option value="updatedAt:asc">Mise à jour (ancien)</option>
          <option value="createdAt:desc">Date de création</option>
          <option value="progress:desc">Progression décroissante</option>
          <option value="progress:asc">Progression croissante</option>
          <option value="reference:asc">Référence A→Z</option>
          <option value="status:asc">Statut</option>
        </select>
      </div>
      {admin && (
        <BulkActionsBar
          selectedIds={[...selected]}
          onClear={() => setSelected(new Set())}
          onDone={() => {
            setSelected(new Set());
            refetch();
          }}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-[#F9FAFB] text-xs font-semibold uppercase tracking-wide text-gray-500">
                {admin && (
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selected.size === rows.length}
                      onChange={() => toggleAll(rows)}
                    />
                  </th>
                )}
                <th className="px-3 py-3">ID dossier</th>
                <th className="px-3 py-3">Nom client</th>
                <th className="px-3 py-3 whitespace-nowrap">Type</th>
                <th className="px-3 py-3">Bien loué</th>
                <th className="px-3 py-3">Statut</th>
                <th className="px-3 py-3 w-40">Progression</th>
                <th className="px-3 py-3">Tags</th>
                <th className="px-3 py-3">Documents manquants</th>
                <th className="px-3 py-3 whitespace-nowrap">Créé le</th>
                <th className="px-3 py-3">Dernière mise à jour</th>
                <th className="px-3 py-3 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const st = dossierStatusUi(row.status, row.progress);
                const isSel = selected.has(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 transition-colors ${i % 2 ? "bg-white" : "bg-[#FAFAFA]"} ${
                      hoverRow === row.id ? "bg-blue-50/80 shadow-sm" : ""
                    }`}
                    onMouseEnter={() => setHoverRow(row.id)}
                    onMouseLeave={() => setHoverRow(null)}
                  >
                    {admin && (
                      <td className="px-3 py-3 align-middle">
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => {
                            const n = new Set(selected);
                            if (n.has(row.id)) n.delete(row.id);
                            else n.add(row.id);
                            setSelected(n);
                          }}
                        />
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <Link
                        href={admin ? `/dossiers/vue?id=${row.id}` : `/dossiers/${row.id}`}
                        className="font-mono text-sm font-medium text-[#2563EB] hover:underline"
                      >
                        {row.reference}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-[#111827]">
                          {row.user.name
                            .split(/\s+/)
                            .map((s) => s[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <span className="font-medium text-[#111827]">{row.user.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {dossierTypeLabel(row.dossierType)}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-3 text-[#374151]" title={row.title || "—"}>
                      {row.title || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${row.progress}%` }} />
                        </div>
                        <span className="w-10 text-right text-xs font-medium text-[#374151]">{row.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <TagBadges tags={row.tags} onAdd={admin ? () => setTagFor(row.id) : undefined} />
                    </td>
                    <td className="max-w-[220px] px-3 py-3 text-xs text-[#374151]">
                      {row.documentsStats.missing === 0 ? (
                        <span className="text-emerald-600">0 manquants</span>
                      ) : (
                        <span className="text-[#DC2626]">{row.documentsStats.missing} manquant(s)</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-[#374151]">
                      {formatDateTimeFr(row.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-[#374151]">
                      {formatDateTimeFr(row.updatedAt)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          <Link
                            href={admin ? `/dossiers/vue?id=${row.id}` : `/dossiers/${row.id}`}
                            className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
                            title="Voir"
                          >
                            👁
                          </Link>
                          <Link
                            href={admin ? `/dossiers/vue?id=${row.id}` : `/dossiers/${row.id}`}
                            className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
                            title="Éditer"
                          >
                            ✎
                          </Link>
                        </div>
                        {admin && hoverRow === row.id && (
                          <QuickRowValidate dossierId={row.id} onDone={() => refetch()} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-sm text-[#374151]">
            Page {meta.page} / {meta.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={page >= meta.totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      </div>

      {!admin && (
        <div className="mt-6 rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center text-sm text-[#374151]">
          <div className="text-2xl">☁</div>
          <p className="mt-2">Glissez et déposez vos fichiers ici ou cliquez pour sélectionner</p>
          <p className="mt-1 text-xs text-gray-400">Utilisez la fiche dossier pour associer un document à un type.</p>
        </div>
      )}

      {tagFor && <TagPickerModal dossierId={tagFor} onClose={() => setTagFor(null)} onDone={() => refetch()} />}
    </div>
  );
}
