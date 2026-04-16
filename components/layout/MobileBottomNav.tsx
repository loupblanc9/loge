"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Item({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs ${
        active ? "text-[#2563EB]" : "text-gray-500"
      }`}
    >
      <span className={`text-lg ${active ? "" : "opacity-80"}`}>{icon}</span>
      <span className={`${active ? "font-medium" : ""}`}>{label}</span>
    </Link>
  );
}

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        <Item href="/dossiers/mes" label="Dossiers" icon="📁" />
        <Item href="/recherche" label="Recherche" icon="⌕" />
        <Item href="/notifications" label="Notifications" icon="🔔" />
        <Item href="/profil" label="Profil" icon="👤" />
      </div>
    </nav>
  );
}

