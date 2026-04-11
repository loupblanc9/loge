"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DossierTable } from "@/components/dossiers/DossierTable";
import { useMe } from "@/hooks/queries";

export default function DossiersMesPage() {
  const { data: user } = useMe();
  const admin = user?.role === "admin";
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin" && !searchParams.get("q")) {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("q", user.email);
      router.replace(`/dossiers/mes?${sp.toString()}`);
    }
  }, [user, router, searchParams]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-[#111827]">Mes dossiers</h1>
      {admin && (
        <p className="mb-3 text-xs text-[#374151]">
          Vue filtrée sur votre compte administrateur. Pour tous les dossiers, utilisez « Tous les dossiers ».
        </p>
      )}
      <DossierTable admin={!!admin} />
    </div>
  );
}
