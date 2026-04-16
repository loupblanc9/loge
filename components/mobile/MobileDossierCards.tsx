"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useDossiersList } from "@/hooks/queries";
import { toApiListParams } from "@/lib/filter-url";
import { dossierStatusUi } from "@/lib/dossier-status-ui";
import { formatDateTimeFr } from "@/lib/format";

export function MobileDossierCards({ admin }: { admin: boolean }) {
  const searchParams = useSearchParams();
  const apiQs = useMemo(() => toApiListParams(searchParams), [searchParams]);
  const { data, isLoading } = useDossiersList(apiQs);

  if (isLoading) return <div className="py-10 text-center text-sm text-gray-500">Chargement…</div>;
  const rows = data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200" />
        Aucun dossier trouvé
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((d) => {
        const st = dossierStatusUi(d.status, d.progress);
        const href = admin ? `/dossiers/vue?id=${d.id}` : `/dossiers/${d.id}`;
        return (
          <Link
            key={d.id}
            href={href}
            className="block rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-200 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#2563EB]">{d.reference}</div>
                <div className="mt-0.5 text-xs text-[#374151]">
                  {d.user.name} — {formatDateTimeFr(d.updatedAt)}
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.className}`}>
                {st.label}
              </span>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs text-[#374151]">
                <span>Avancement</span>
                <span className="font-medium text-[#111827]">{d.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${d.progress}%` }} />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {d.tags.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className="rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-gray-200"
                  style={{ backgroundColor: `${t.color}22` }}
                >
                  {t.name}
                </span>
              ))}
              {d.tags.length > 3 && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
                  +{d.tags.length - 3}
                </span>
              )}
            </div>

            {d.documentsStats.missing > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#DC2626]">
                <span>!</span>
                {d.documentsStats.missing} document(s) manquant(s)
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

