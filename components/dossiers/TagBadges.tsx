"use client";

import type { DossierListItem } from "@/types/api";

export function TagBadges({ tags, onAdd }: { tags: DossierListItem["tags"]; onAdd?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {tags.map((t) => (
        <span
          key={t.id}
          className="inline-flex max-w-[120px] truncate rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ring-gray-200"
          style={{ backgroundColor: `${t.color}22` }}
          title={t.name}
        >
          {t.name}
        </span>
      ))}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-[11px] text-[#2563EB] hover:bg-blue-50"
        >
          + tag
        </button>
      )}
    </div>
  );
}
