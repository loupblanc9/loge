"use client";

import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useMe, useLogout } from "@/hooks/queries";

export default function ProfilPage() {
  const { data: user } = useMe();
  const router = useRouter();
  const logout = useLogout();

  return (
    <div className="mx-auto max-w-md">
      <BrandLogo href="/dashboard" variant="full" size="sm" theme="light" className="mb-4" />
      <h1 className="mb-3 text-base font-semibold text-[#111827]">Profil</h1>
      <div className="rounded-3xl bg-white p-5 ring-1 ring-gray-200">
        <div className="text-sm font-semibold text-[#111827]">{user?.name ?? "—"}</div>
        <div className="mt-1 text-xs text-[#374151]">{user?.email ?? ""}</div>
        <div className="mt-3 text-[11px] font-medium uppercase tracking-wide text-[#2563EB]">
          {user?.role === "admin" ? "Administrateur" : "Locataire"}
        </div>

        <button
          type="button"
          onClick={() =>
            logout.mutate(undefined, {
              onSuccess: () => router.push("/"),
            })
          }
          className="mt-5 h-11 w-full rounded-2xl bg-[#111827] text-sm font-semibold text-white"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

