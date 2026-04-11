"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateDossier } from "@/hooks/queries";

export default function NouveauDossierPage() {
  const router = useRouter();
  const create = useCreateDossier();
  const [title, setTitle] = useState("");

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-[#111827]">Créer un dossier</h1>
      <p className="mt-1 text-sm text-[#374151]">Un numéro DOSSIER-XXXX sera attribué automatiquement.</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(
            { title: title.trim() || undefined },
            {
              onSuccess: (res: unknown) => {
                const id = (res as { dossier?: { id: string } })?.dossier?.id;
                if (id) router.push(`/dossiers/${id}`);
                else router.push("/dossiers/mes");
              },
            },
          );
        }}
      >
        <div>
          <label className="text-xs font-medium text-gray-600">Intitulé / bien loué (optionnel)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Appartement T3 — Lyon 6ème"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
          />
        </div>
        <button
          type="submit"
          disabled={create.isPending}
          className="w-full rounded-lg bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {create.isPending ? "Création…" : "Créer le dossier"}
        </button>
      </form>
    </div>
  );
}
