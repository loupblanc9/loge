"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/types/api";
import type { FilterState } from "@/types/filters";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchQuery } from "@/hooks/queries";
import { MobileFiltersSheet } from "@/components/mobile/MobileFiltersSheet";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function MobileTopBar({
  user,
  showFilters,
  filterState,
  onApplyFilters,
  onResetFilters,
}: {
  user: SessionUser;
  showFilters: boolean;
  filterState: FilterState;
  onApplyFilters: (f: FilterState) => void;
  onResetFilters: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const debounced = useDebounce(q, 250);
  const { data } = useSearchQuery(debounced);
  const [openFilters, setOpenFilters] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-md px-4 py-3">
        <div className="flex items-center gap-3">
          <BrandLogo href="/dashboard" variant="full" size="sm" theme="light" className="min-w-0 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-[#374151]">Bonjour, {user.name.split(" ")[0] ?? user.name}</div>
          </div>
          {showFilters && (
            <button
              type="button"
              onClick={() => setOpenFilters(true)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-[#374151]"
            >
              Filtres
            </button>
          )}
        </div>

        <div className="relative mt-3">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un dossier…"
            className="h-11 w-full rounded-2xl border border-gray-200 bg-[#F9FAFB] pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]"
          />
          {debounced.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              {(data?.data ?? []).slice(0, 6).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className="flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-gray-50"
                  onClick={() => {
                    setQ("");
                    router.push(user.role === "admin" ? `/dossiers/vue?id=${d.id}` : `/dossiers/${d.id}`);
                  }}
                >
                  <span className="text-sm font-semibold text-[#111827]">{d.reference}</span>
                  <span className="text-xs text-[#374151]">{d.user.name}</span>
                </button>
              ))}
              {(data?.data ?? []).length === 0 && (
                <div className="px-4 py-3 text-xs text-gray-500">Aucun résultat</div>
              )}
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <MobileFiltersSheet
          open={openFilters}
          onClose={() => setOpenFilters(false)}
          state={filterState}
          onApply={(f) => {
            onApplyFilters(f);
            setOpenFilters(false);
          }}
          onReset={() => {
            onResetFilters();
            setOpenFilters(false);
          }}
        />
      )}
    </header>
  );
}

