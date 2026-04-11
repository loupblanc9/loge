"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/types/api";

const nav = [
  { href: "/dashboard", label: "Tableau de bord", icon: "▦" },
  { href: "/dossiers/tous", label: "Tous les dossiers", icon: "▣", adminOnly: true },
  { href: "/dossiers/mes", label: "Mes dossiers", icon: "◎" },
  { href: "/dossiers/vue", label: "Vue fractionnée", icon: "⧉" },
  { href: "/dossiers/nouveau", label: "Créer un dossier", icon: "+" },
];

function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-slate-800/80 bg-[#0f172a] text-white">
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold">D</span>
        <span className="text-sm font-semibold tracking-tight">DossierLoc</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {nav
          .filter((n) => !("adminOnly" in n && n.adminOnly && !isAdmin))
          .map((item) => {
            const active =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-[#2563EB] text-white shadow-sm" : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <span className="w-5 text-center opacity-80">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
      </nav>
      {isAdmin && (
        <div className="border-t border-white/10 p-3">
          <Link
            href="/admin/tags"
            className={cx(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white",
              pathname.startsWith("/admin") && "bg-white/10 text-white",
            )}
          >
            <span className="w-5 text-center">⚙</span>
            Gestion (admin)
          </Link>
        </div>
      )}
    </aside>
  );
}
