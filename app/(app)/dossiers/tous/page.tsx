"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/queries";
import { DossierTable } from "@/components/dossiers/DossierTable";

export default function DossiersTousPage() {
  const { data: user, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== "admin") {
      router.replace("/dossiers/mes");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "admin") {
    return <div className="py-12 text-center text-sm text-gray-500">Vérification des droits…</div>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Tous les dossiers</h1>
          <p className="text-sm text-[#374151]">
            Filtres dans la barre supérieure · survol d’une ligne : raccourcis valider / refuser · sélection multiple : actions
            groupées
          </p>
        </div>
      </div>
      <DossierTable admin />
    </div>
  );
}
