"use client";

import { useState } from "react";
import { useAdminBulk, useTags } from "@/hooks/queries";

type Props = {
  selectedIds: string[];
  onClear: () => void;
  onDone: () => void;
};

export function BulkActionsBar({ selectedIds, onClear, onDone }: Props) {
  const bulk = useAdminBulk();
  const { data: tags } = useTags();
  const [tagId, setTagId] = useState("");
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (selectedIds.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-[#111827]">Actions rapides</div>
        <span className="text-xs text-[#374151]">Actions groupées…</span>
      </div>
      <p className="mb-3 text-sm text-[#374151]">
        <span className="font-medium text-[#111827]">{selectedIds.length}</span> dossier(s) sélectionné(s)
      </p>
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
          value={tagId}
          onChange={(e) => setTagId(e.target.value)}
        >
          <option value="">Tag à ajouter…</option>
          {tags?.tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!tagId || bulk.isPending}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#2563EB] hover:bg-blue-50 disabled:opacity-40"
          onClick={() =>
            bulk.mutate({ action: "addTag", dossierIds: selectedIds, tagId }, { onSuccess: onDone })
          }
        >
          Ajouter un tag
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#374151] hover:bg-gray-50"
          onClick={() =>
            bulk.mutate({ action: "markProcessed", dossierIds: selectedIds }, { onSuccess: onDone })
          }
        >
          Marquer comme traité
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#374151] hover:bg-gray-50"
          onClick={async () => {
            const content = note.trim() || window.prompt("Note interne à ajouter à chaque dossier :");
            if (!content) return;
            for (const id of selectedIds) {
              await fetch(`/api/dossiers/${id}/notes`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
              });
            }
            onDone();
            setNote("");
          }}
        >
          Ajouter une note
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#374151] hover:bg-gray-50"
          onClick={async () => {
            const r = await fetch("/api/admin/dossiers/bulk", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "export", dossierIds: selectedIds }),
            });
            const j = await r.json();
            const blob = new Blob([JSON.stringify(j, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "dossiers-export.json";
            a.click();
          }}
        >
          Exporter
        </button>
        <button
          type="button"
          className="rounded-lg border border-[#DC2626] px-3 py-2 text-sm font-medium text-[#DC2626] hover:bg-red-50"
          onClick={() => setConfirmDelete(true)}
        >
          Supprimer
        </button>
        <button type="button" onClick={onClear} className="ml-auto text-sm text-gray-500 hover:text-gray-800">
          Effacer sélection
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#111827]">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-[#374151]">
              Êtes-vous sûr de vouloir supprimer les {selectedIds.length} dossiers sélectionnés ? Cette action est
              irréversible.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
                onClick={() => setConfirmDelete(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white"
                onClick={() =>
                  bulk.mutate(
                    { action: "delete", dossierIds: selectedIds },
                    {
                      onSuccess: () => {
                        setConfirmDelete(false);
                        onDone();
                      },
                    },
                  )
                }
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
