"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { SessionUser } from "@/types/api";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { UserMenu } from "./UserMenu";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchQuery } from "@/hooks/queries";
import { AdvancedFilters, type FilterState } from "@/components/filters/AdvancedFilters";

export function TopBar({
  user,
  showFilters,
  filterState,
  onApplyFilters,
  onResetFilters,
  listSearchParams,
  onCommitListQuery,
  searchPlaceholder = "Rechercher un dossier, un locataire…",
}: {
  user: SessionUser;
  showFilters: boolean;
  filterState: FilterState;
  onApplyFilters: (f: FilterState) => void;
  onResetFilters: () => void;
  listSearchParams?: URLSearchParams;
  onCommitListQuery?: (q: string) => void;
  searchPlaceholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const spQ = listSearchParams?.get("q") ?? "";
  const [q, setQ] = useState(spQ);
  const [openSearch, setOpenSearch] = useState(false);
  const debounced = useDebounce(q, 250);
  const { data: searchData, isFetching } = useSearchQuery(debounced);

  useEffect(() => {
    setQ(spQ);
  }, [spQ]);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-14 flex-wrap items-center gap-4 px-6 py-2">
        <BrandLogo href="/dashboard" variant="mark" size="sm" theme="light" className="hidden shrink-0 sm:inline-flex" />
        <div className="relative min-w-0 max-w-3xl flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpenSearch(true);
            }}
            onFocus={() => setOpenSearch(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onCommitListQuery) {
                onCommitListQuery(q.trim());
                setOpenSearch(false);
              }
            }}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-gray-200 bg-[#F9FAFB] pl-9 pr-3 text-sm text-[#111827] placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
          {openSearch && debounced.length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {isFetching && <div className="px-3 py-2 text-xs text-gray-500">Recherche…</div>}
              {!isFetching &&
                searchData?.data?.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-gray-50"
                    onClick={() => {
                      setOpenSearch(false);
                      setQ("");
                      if (pathname.startsWith("/dossiers/vue")) {
                        router.push(`/dossiers/vue?id=${d.id}`);
                      } else if (user.role === "admin") {
                        router.push(`/dossiers/vue?id=${d.id}`);
                      } else {
                        router.push(`/dossiers/${d.id}`);
                      }
                    }}
                  >
                    <span className="text-sm font-medium text-[#111827]">{d.reference}</span>
                    <span className="text-xs text-[#374151]">{d.user.name}</span>
                  </button>
                ))}
              {!isFetching && searchData?.data?.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">Aucun résultat</div>
              )}
            </div>
          )}
        </div>
        {showFilters && (
          <AdvancedFilters state={filterState} onApply={onApplyFilters} onReset={onResetFilters} />
        )}
        <button
          type="button"
          className="relative hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 sm:flex"
          aria-label="Notifications"
        >
          🔔
        </button>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
