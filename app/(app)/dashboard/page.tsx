"use client";

import Link from "next/link";
import { useMe } from "@/hooks/queries";

export default function DashboardPage() {
  const { data: user, isLoading } = useMe();

  if (isLoading || !user) {
    return <div className="text-sm text-gray-500">Chargement…</div>;
  }

  const admin = user.role === "admin";

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">Tableau de bord</h1>
      <p className="mt-1 text-sm text-[#374151]">
        Bienvenue, <span className="font-medium">{user.name}</span>
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {admin && (
          <Link
            href="/dossiers/tous"
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#2563EB]/40 hover:shadow"
          >
            <h2 className="font-semibold text-[#111827]">Tous les dossiers</h2>
            <p className="mt-2 text-sm text-[#374151]">Vue tableau, filtres et actions groupées</p>
          </Link>
        )}
        <Link
          href="/dossiers/mes"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#2563EB]/40 hover:shadow"
        >
          <h2 className="font-semibold text-[#111827]">Mes dossiers</h2>
          <p className="mt-2 text-sm text-[#374151]">Liste de vos dossiers locatifs</p>
        </Link>
        <Link
          href="/dossiers/vue"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#2563EB]/40 hover:shadow"
        >
          <h2 className="font-semibold text-[#111827]">Vue fractionnée</h2>
          <p className="mt-2 text-sm text-[#374151]">Liste + détail sans rechargement</p>
        </Link>
        <Link
          href="/dossiers/nouveau"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#2563EB]/40 hover:shadow"
        >
          <h2 className="font-semibold text-[#2563EB]">+ Créer un dossier</h2>
          <p className="mt-2 text-sm text-[#374151]">Nouveau dossier avec checklist documents</p>
        </Link>
      </div>
    </div>
  );
}
