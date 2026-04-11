"use client";

import { useState } from "react";
import { useTags, useDossierTag } from "@/hooks/queries";

export function TagPickerModal({
  dossierId,
  onClose,
  onDone,
}: {
  dossierId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const { data } = useTags();
  const { attach } = useDossierTag(dossierId);
  const [tagId, setTagId] = useState("");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-[#111827]">Ajouter un tag</h3>
        <select
          className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={tagId}
          onChange={(e) => setTagId(e.target.value)}
        >
          <option value="">Choisir…</option>
          {data?.tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="rounded-lg border border-gray-200 px-4 py-2 text-sm" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            disabled={!tagId || attach.isPending}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            onClick={() =>
              attach.mutate(tagId, {
                onSuccess: () => {
                  onDone();
                  onClose();
                },
              })
            }
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
