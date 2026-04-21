import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";

export default async function AdminHubPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const cards = [
    {
      href: "/dossiers/tous",
      title: "Liste des dossiers",
      desc: "Table complète, filtres, actions groupées et tri.",
      icon: "▣",
    },
    {
      href: "/dossiers/vue",
      title: "Vue traitement",
      desc: "Liste + détail côte à côte pour valider/refuser rapidement.",
      icon: "⧉",
    },
    {
      href: "/admin/tags",
      title: "Tags",
      desc: "Organiser et filtrer les dossiers par étiquettes.",
      icon: "🏷",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="border-b border-gray-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">DOMICIAL · Équipe</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#111827]">Back-office</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#374151]">
          Traitez les dossiers locataires : vue d’ensemble, filtres métier, fiche détail avec documents et notes internes.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-1">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#2563EB]/30 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl text-[#2563EB] transition group-hover:bg-blue-50">
              {c.icon}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-[#111827] group-hover:text-[#2563EB]">{c.title}</h2>
              <p className="mt-1 text-sm text-[#374151]">{c.desc}</p>
            </div>
            <span className="self-center text-gray-300 transition group-hover:text-[#2563EB]">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
