"use client";

import type { SessionUser } from "@/types/api";
import { DossierDetailView } from "@/components/dossiers/DossierDetailView";

export function ClientDossierPage({ dossierId, user }: { dossierId: string; user: SessionUser }) {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-[#111827]">Dossier</h1>
      <DossierDetailView dossierId={dossierId} session={user} compact />
    </div>
  );
}
