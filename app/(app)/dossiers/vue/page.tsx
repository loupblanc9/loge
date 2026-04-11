import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { SplitDossierView } from "@/components/dossiers/SplitDossierView";

function Fallback() {
  return <div className="py-12 text-center text-sm text-gray-500">Chargement de la vue…</div>;
}

export default async function DossiersVuePage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-[#111827]">Vue fractionnée</h1>
      <Suspense fallback={<Fallback />}>
        <SplitDossierView user={user} />
      </Suspense>
    </div>
  );
}
