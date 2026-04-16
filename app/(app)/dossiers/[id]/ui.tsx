"use client";

import type { SessionUser } from "@/types/api";
import { DossierDetailView } from "@/components/dossiers/DossierDetailView";
import { MobileDossierDetail } from "@/components/mobile/MobileDossierDetail";

export function ClientDossierPage({ dossierId, user }: { dossierId: string; user: SessionUser }) {
  return (
    <div>
      {/* Mobile */}
      <div className="md:hidden">
        <MobileDossierDetail dossierId={dossierId} user={user} />
      </div>

      {/* Desktop (inchangé) */}
      <div className="hidden md:block">
        <h1 className="mb-4 text-xl font-semibold text-[#111827]">Dossier</h1>
        <DossierDetailView dossierId={dossierId} session={user} compact />
      </div>
    </div>
  );
}
