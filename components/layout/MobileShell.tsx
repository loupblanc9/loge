"use client";

import type { SessionUser } from "@/types/api";
import type { FilterState } from "@/types/filters";
import { MobileTopBar } from "./MobileTopBar";
import { MobileBottomNav } from "./MobileBottomNav";

export function MobileShell({
  user,
  children,
  showFilters,
  filterState,
  onApplyFilters,
  onResetFilters,
}: {
  user: SessionUser;
  children: React.ReactNode;
  showFilters: boolean;
  filterState: FilterState;
  onApplyFilters: (f: FilterState) => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <MobileTopBar
        user={user}
        showFilters={showFilters}
        filterState={filterState}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
      />
      <main className="px-4 pb-6 pt-4">{children}</main>
      <MobileBottomNav />
    </div>
  );
}

