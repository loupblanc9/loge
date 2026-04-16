"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useCallback } from "react";
import type { SessionUser } from "@/types/api";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileShell } from "./MobileShell";
import { defaultFilterState, type FilterState } from "@/types/filters";
import { filtersToSearchParams, parseFilters } from "@/lib/filter-url";

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const showFilters =
    pathname.startsWith("/dossiers/tous") ||
    pathname.startsWith("/dossiers/mes") ||
    pathname.startsWith("/dossiers/vue");

  const filterState: FilterState = useMemo(() => parseFilters(searchParams), [searchParams]);

  const applyFilters = useCallback(
    (f: FilterState) => {
      const sp = filtersToSearchParams(f, searchParams, pathname);
      router.push(`${pathname}?${sp.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const resetFilters = useCallback(() => {
    const sp = new URLSearchParams();
    const id = searchParams.get("id");
    if (id && pathname.includes("/vue")) sp.set("id", id);
    router.push(sp.toString() ? `${pathname}?${sp}` : pathname);
  }, [pathname, router, searchParams]);

  const commitListQuery = useCallback(
    (q: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (q) sp.set("q", q);
      else sp.delete("q");
      sp.set("page", "1");
      router.replace(`${pathname}?${sp.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const mergedFilterState = useMemo(() => ({ ...defaultFilterState, ...filterState }), [filterState]);

  return (
    <>
      {/* Desktop (inchangé) */}
      <div className="hidden min-h-screen bg-[#F9FAFB] pl-[240px] md:block">
        <Sidebar user={user} />
        <div className="flex min-h-screen flex-col">
          <TopBar
            user={user}
            showFilters={showFilters}
            filterState={mergedFilterState}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
            listSearchParams={showFilters ? searchParams : undefined}
            onCommitListQuery={showFilters ? commitListQuery : undefined}
            searchPlaceholder={
              pathname.includes("/dossiers/vue")
                ? "Rechercher…"
                : "Rechercher un dossier, un locataire…"
            }
          />
          <div className="flex-1 p-6">{children}</div>
        </div>
      </div>

      {/* Mobile (nouveau) */}
      <div className="md:hidden">
        <MobileShell user={user} showFilters={showFilters} filterState={mergedFilterState} onApplyFilters={applyFilters} onResetFilters={resetFilters}>
          {children}
        </MobileShell>
      </div>
    </>
  );
}
