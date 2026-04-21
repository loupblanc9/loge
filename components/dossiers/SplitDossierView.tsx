"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { SessionUser } from "@/types/api";
import { useDossiersList } from "@/hooks/queries";
import { toApiListParams } from "@/lib/filter-url";
import { dossierStatusUi } from "@/lib/dossier-status-ui";
import { DossierDetailView } from "./DossierDetailView";

function typeLabel(dt: import("@/types/api").DossierListItem["dossierType"]) {
  if (dt === "social") return "Social";
  if (dt === "prive") return "Privé";
  return "";
}

export function SplitDossierView({ user }: { user: SessionUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const apiQs = useMemo(() => toApiListParams(searchParams), [searchParams]);
  const { data, isLoading } = useDossiersList(apiQs);
  const [localQ, setLocalQ] = useState("");

  const rows = useMemo(() => {
    const r = data?.data ?? [];
    const q = localQ.trim().toLowerCase();
    if (!q) return r;
    return r.filter(
      (d) =>
        d.reference.toLowerCase().includes(q) ||
        d.user.name.toLowerCase().includes(q) ||
        (d.title && d.title.toLowerCase().includes(q)),
    );
  }, [data?.data, localQ]);

  const select = (id: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("id", id);
    router.replace(`/dossiers/vue?${sp.toString()}`);
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] gap-4">
      <aside className="w-full max-w-[360px] shrink-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm lg:w-[30%]">
        <div className="mb-3 flex gap-2">
          <input
            type="search"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Rechercher dans mes dossiers"
            className="h-9 flex-1 rounded-lg border border-gray-200 bg-[#F9FAFB] px-2 text-sm outline-none focus:border-[#2563EB]"
          />
          <button type="button" className="rounded-lg border border-gray-200 px-2 text-gray-500" title="Filtres globaux en haut">
            ⚙
          </button>
        </div>
        <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
          {isLoading && <p className="p-4 text-sm text-gray-500">Chargement…</p>}
          {!isLoading &&
            rows.map((d) => {
              const st = dossierStatusUi(d.status, d.progress);
              const active = d.id === selectedId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => select(d.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    active ? "border-[#2563EB] bg-blue-50/50 shadow-sm" : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-xs font-semibold text-[#2563EB]">{d.reference}</div>
                      <div className="text-sm font-medium text-[#111827]">{d.user.name}</div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.className}`}>
                      {st.label}
                    </span>
                  </div>
                  {typeLabel(d.dossierType) ? (
                    <div className="mt-1 text-[10px] font-medium text-slate-600">{typeLabel(d.dossierType)}</div>
                  ) : null}
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-[10px] text-[#374151]">
                      <span>Progression</span>
                      <span>{d.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${d.progress}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </aside>
      <main className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:w-[70%]">
        {selectedId ? (
          <DossierDetailView dossierId={selectedId} session={user} />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-gray-500">
            Sélectionnez un dossier dans la liste.
          </div>
        )}
      </main>
    </div>
  );
}
