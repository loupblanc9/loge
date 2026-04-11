"use client";

import { useBulkDocs } from "@/hooks/queries";

export function QuickRowValidate({ dossierId, onDone }: { dossierId: string; onDone: () => void }) {
  const bulk = useBulkDocs(dossierId);
  return (
    <div className="flex flex-wrap gap-1 pt-1">
      <button
        type="button"
        className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-[#16A34A]"
        onClick={() => bulk.mutate("approveAll", { onSuccess: onDone })}
        disabled={bulk.isPending}
      >
        Valider
      </button>
      <button
        type="button"
        className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-[#DC2626]"
        onClick={() => bulk.mutate("rejectAllUploaded", { onSuccess: onDone })}
        disabled={bulk.isPending}
      >
        Refuser
      </button>
    </div>
  );
}
