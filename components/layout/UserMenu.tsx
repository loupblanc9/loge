"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { SessionUser } from "@/types/api";
import { useLogout } from "@/hooks/queries";

export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const logout = useLogout();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const initials = user.name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-[#111827] ring-2 ring-white hover:bg-slate-300"
        aria-expanded={open}
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate text-sm font-medium text-[#111827]">{user.name}</p>
            <p className="truncate text-xs text-[#374151]">{user.email}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#2563EB]">
              {user.role === "admin" ? "Administrateur" : "Locataire"}
            </p>
          </div>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-[#DC2626] hover:bg-gray-50"
            onClick={() => {
              logout.mutate(undefined, {
                onSuccess: () => router.push("/login"),
              });
            }}
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
