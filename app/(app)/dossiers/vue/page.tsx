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
  if (user.role !== "admin") redirect("/dashboard");
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-[#111827]">Vue traitement</h1>
      <p className="mb-4 text-sm text-[#374151]">Sélectionnez un dossier à gauche, traitez les pièces et le statut à droite.</p>
      <Suspense fallback={<Fallback />}>
        <SplitDossierView user={user} />
      </Suspense>
    </div>
  );
}
