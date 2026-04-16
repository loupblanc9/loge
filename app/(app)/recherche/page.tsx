"use client";

import { useState } from "react";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchQuery } from "@/hooks/queries";
import { dossierStatusUi } from "@/lib/dossier-status-ui";

export default function RecherchePage() {
  const [q, setQ] = useState("");
  const debounced = useDebounce(q, 250);
  const { data, isFetching } = useSearchQuery(debounced);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-3 text-base font-semibold text-[#111827]">Recherche</h1>
      <input
        className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#2563EB]"
        placeholder="Rechercher un dossier, un nom…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {isFetching && <div className="mt-3 text-xs text-gray-500">Recherche…</div>}

      <div className="mt-4 space-y-3">
        {(data?.data ?? []).map((d) => {
          const st = dossierStatusUi(d.status, d.progress);
          return (
            <Link
              key={d.id}
              href={`/dossiers/${d.id}`}
              className="block rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#2563EB]">{d.reference}</div>
                  <div className="text-xs text-[#374151]">{d.user.name}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.className}`}>
                  {st.label}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${d.progress}%` }} />
              </div>
            </Link>
          );
        })}

        {debounced.trim().length >= 2 && (data?.data?.length ?? 0) === 0 && !isFetching && (
          <div className="rounded-3xl bg-white p-6 text-center text-sm text-gray-500 ring-1 ring-gray-200">
            Aucun résultat
          </div>
        )}
      </div>
    </div>
  );
}

