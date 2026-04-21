"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMe, useAdminClientDetail, usePatchAdminClient } from "@/hooks/queries";
import { formatDateTimeFr } from "@/lib/format";
import { dossierStatusUi } from "@/lib/dossier-status-ui";
import { labelForType } from "@/lib/constants/document-types";

export default function AdminClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { data: session, isLoading: sessionLoading } = useMe();
  const { data, isLoading, refetch } = useAdminClientDetail(id);
  const patch = usePatchAdminClient(id ?? "");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!sessionLoading && session && session.role !== "admin") router.replace("/dashboard");
  }, [sessionLoading, session, router]);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name);
      setPhone(data.user.phone ?? "");
      setDirty(false);
    }
  }, [data?.user]);

  if (sessionLoading || !session || session.role !== "admin") {
    return <div className="py-12 text-center text-sm text-gray-500">Vérification des droits…</div>;
  }

  if (isLoading || !id) {
    return <div className="py-12 text-center text-sm text-gray-500">Chargement…</div>;
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">
        Client introuvable.{" "}
        <Link href="/admin/clients" className="font-medium underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const { user, dossiers } = data;

  const save = () => {
    patch.mutate(
      {
        name: name.trim() || user.name,
        phone: phone.trim() === "" ? null : phone.trim(),
      },
      { onSuccess: () => refetch() },
    );
    setDirty(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/admin/clients" className="text-sm text-[#2563EB] hover:underline">
            ← Clients
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-[#111827]">{user.name}</h1>
          <p className="text-sm text-[#374151]">{user.email}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#111827]">Informations (modifiable)</h2>
        <p className="mt-1 text-xs text-gray-500">{user.dossierCount} dossier(s) · inscrit le {formatDateTimeFr(user.createdAt)}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-gray-600">
            Nom
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setDirty(true);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-gray-600">
            Téléphone
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setDirty(true);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="06 …"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={!dirty || patch.isPending}
          onClick={save}
          className="mt-4 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Enregistrer
        </button>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[#111827]">Dossiers</h2>
        {dossiers.length === 0 && <p className="text-sm text-gray-500">Aucun dossier pour ce compte.</p>}
        {dossiers.map((d) => {
          const st = dossierStatusUi(d.status, d.progress);
          return (
            <div key={d.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-[#F9FAFB] px-4 py-3">
                <div>
                  <div className="font-mono text-sm font-semibold text-[#2563EB]">{d.reference}</div>
                  <div className="text-xs text-gray-500">MAJ {formatDateTimeFr(d.updatedAt)}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${st.className}`}>
                    {st.label}
                  </span>
                  <span className="text-xs text-gray-600">{d.progress}%</span>
                  <Link
                    href={`/dossiers/vue?id=${d.id}`}
                    className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                  >
                    Ouvrir (traitement)
                  </Link>
                  <Link href={`/dossiers/${d.id}`} className="text-xs font-medium text-[#2563EB] underline">
                    Vue pleine page
                  </Link>
                </div>
              </div>
              <div className="grid gap-4 p-4 lg:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">Pièces</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {d.documents.map((doc) => (
                      <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 py-1">
                        <span>{labelForType(doc.type)} (locataire)</span>
                        {doc.fileUrl ? (
                          <span className="flex gap-2">
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-[#2563EB]">
                              Voir
                            </a>
                            <a href={`${doc.fileUrl}${doc.fileUrl.includes("?") ? "&" : "?"}download=1`} className="text-xs text-gray-600">
                              Télécharger
                            </a>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Manquant</span>
                        )}
                      </li>
                    ))}
                    {d.guarantors.flatMap((g) =>
                      g.documents.map((doc) => (
                        <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 py-1">
                          <span>
                            {labelForType(doc.type)} (garant{g.name ? ` ${g.name}` : ""})
                          </span>
                          {doc.fileUrl ? (
                            <span className="flex gap-2">
                              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-[#2563EB]">
                                Voir
                              </a>
                              <a href={`${doc.fileUrl}${doc.fileUrl.includes("?") ? "&" : "?"}download=1`} className="text-xs text-gray-600">
                                Télécharger
                              </a>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Manquant</span>
                          )}
                        </li>
                      )),
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">Notes internes</h3>
                  <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto text-sm">
                    {d.notes?.length ? (
                      d.notes.map((n) => (
                        <li key={n.id} className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs text-[#374151]">
                          <div className="font-medium text-[#111827]">{n.author.name}</div>
                          <div>{n.content}</div>
                          <div className="text-[10px] text-gray-400">{formatDateTimeFr(n.createdAt)}</div>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-gray-400">Aucune note sur ce dossier.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
