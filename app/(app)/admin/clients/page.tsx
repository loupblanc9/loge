"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMe, useAdminClientsList } from "@/hooks/queries";
import { formatDateTimeFr } from "@/lib/format";
import { dossierStatusUi } from "@/lib/dossier-status-ui";

export default function AdminClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading: userLoading } = useMe();
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const [draft, setDraft] = useState(q);

  useEffect(() => {
    setDraft(q);
  }, [q]);

  const apiQs = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    p.set("page", String(page));
    return p.toString();
  }, [q, page]);

  const { data, isLoading } = useAdminClientsList(apiQs);

  useEffect(() => {
    if (!userLoading && user && user.role !== "admin") router.replace("/dashboard");
  }, [userLoading, user, router]);

  if (userLoading || !user || user.role !== "admin") {
    return <div className="py-12 text-center text-sm text-gray-500">Vérification des droits…</div>;
  }

  const setPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(p));
    router.push(`/admin/clients?${sp.toString()}`);
  };

  const commitSearch = () => {
    const sp = new URLSearchParams();
    if (draft.trim()) sp.set("q", draft.trim());
    sp.set("page", "1");
    router.push(`/admin/clients?${sp.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">Clients</h1>
        <p className="text-sm text-[#374151]">
          Vue d’ensemble des comptes locataires — recherche par nom, email ou téléphone.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Rechercher…"
          className="min-w-[200px] flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          onKeyDown={(e) => e.key === "Enter" && commitSearch()}
        />
        <button type="button" onClick={commitSearch} className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-medium text-white">
          Rechercher
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Chargement…</p>}
      {!isLoading && data && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-[#F9FAFB] text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-3">Client</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Téléphone</th>
                  <th className="px-3 py-3">Dossiers</th>
                  <th className="px-3 py-3">Dossier récent</th>
                  <th className="px-3 py-3">Inscription</th>
                  <th className="px-3 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {data.data.map((row, i) => {
                  const st =
                    row.lastDossierStatus != null
                      ? dossierStatusUi(row.lastDossierStatus, 50)
                      : { label: "—", className: "bg-gray-50 text-gray-500 ring-1 ring-gray-200" };
                  return (
                    <tr key={row.id} className={`border-b border-gray-100 ${i % 2 ? "bg-white" : "bg-[#FAFAFA]"}`}>
                      <td className="px-3 py-3 font-medium text-[#111827]">{row.name}</td>
                      <td className="px-3 py-3 text-[#374151]">{row.email}</td>
                      <td className="px-3 py-3 text-[#374151]">{row.phone || "—"}</td>
                      <td className="px-3 py-3">{row.dossierCount}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${st.className}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-[#374151]">
                        {formatDateTimeFr(row.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/clients/${row.id}`}
                          className="font-medium text-[#2563EB] hover:underline"
                        >
                          Fiche
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-sm text-[#374151]">
              Page {data.meta.page} / {data.meta.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
