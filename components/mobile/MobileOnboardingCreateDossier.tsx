"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Spinner } from "@/components/brand/Spinner";
import { useCreateDossier } from "@/hooks/queries";
import { PRIVATE_DOCUMENT_TYPES, SOCIAL_DOCUMENT_TYPES } from "@/lib/constants/document-types";

type Step = 1 | 2 | 3;

export function MobileOnboardingCreateDossier() {
  const [step, setStep] = useState<Step>(1);
  const [type, setType] = useState<"social" | "prive" | null>(null);
  const router = useRouter();
  const create = useCreateDossier();

  const docs = useMemo(() => {
    if (type === "social") return SOCIAL_DOCUMENT_TYPES;
    if (type === "prive") return PRIVATE_DOCUMENT_TYPES;
    return [];
  }, [type]);

  return (
    <div className="mx-auto max-w-md">
      <BrandLogo href="/dashboard" variant="full" size="sm" theme="light" className="mb-4" />
      <div className="mb-4">
        <h1 className="text-base font-semibold text-[#111827]">Créer un dossier</h1>
        <p className="mt-1 text-xs text-[#374151]">Parcours guidé, étape par étape.</p>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
        <Dot on={step >= 1} /> Type
        <span className="opacity-30">—</span>
        <Dot on={step >= 2} /> Documents
        <span className="opacity-30">—</span>
        <Dot on={step >= 3} /> Création
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <CardButton
            title="Logement social"
            subtitle="Checklist complète (numéro unique, DALO, etc.)"
            icon="🏘"
            selected={type === "social"}
            onClick={() => setType("social")}
          />
          <CardButton
            title="Logement privé"
            subtitle="Dossier standard + documents garant"
            icon="🏠"
            selected={type === "prive"}
            onClick={() => setType("prive")}
          />
          <button
            type="button"
            disabled={!type}
            className="mt-2 h-12 w-full rounded-2xl bg-[#2563EB] text-sm font-semibold text-white disabled:opacity-40"
            onClick={() => setStep(2)}
          >
            Continuer
          </button>
        </div>
      )}

      {step === 2 && type && (
        <div>
          <div className="rounded-3xl bg-white p-4 ring-1 ring-gray-200">
            <div className="text-sm font-semibold text-[#111827]">Documents requis — {type === "social" ? "Social" : "Privé"}</div>
            <div className="mt-1 text-xs text-[#374151]">Tu pourras envoyer les documents un par un.</div>

            <div className="mt-4 space-y-2">
              {docs.map((d) => (
                <div key={d.type} className="flex items-center justify-between rounded-2xl bg-[#F9FAFB] px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[#111827]">{d.label}</div>
                    <div className="text-[11px] text-gray-500">{d.required ? "Obligatoire" : "Optionnel"}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                      d.required ? "bg-blue-50 text-[#2563EB] ring-1 ring-blue-200" : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                    }`}
                  >
                    {d.required ? "Obligatoire" : "Optionnel"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="h-12 flex-1 rounded-2xl border border-gray-200 text-sm font-medium text-[#374151]"
              onClick={() => setStep(1)}
            >
              Retour
            </button>
            <button
              type="button"
              className="h-12 flex-1 rounded-2xl bg-[#2563EB] text-sm font-semibold text-white"
              onClick={() => setStep(3)}
            >
              Créer
            </button>
          </div>
        </div>
      )}

      {step === 3 && type && (
        <div className="rounded-3xl bg-white p-5 text-center ring-1 ring-gray-200">
          <div className="text-2xl">✨</div>
          <div className="mt-2 text-sm font-semibold text-[#111827]">Création du dossier…</div>
          <p className="mt-1 text-xs text-[#374151]">Un numéro sera attribué automatiquement.</p>
          <button
            type="button"
            className="mt-4 h-12 w-full rounded-2xl bg-[#2563EB] text-sm font-semibold text-white disabled:opacity-50"
            disabled={create.isPending}
            onClick={() =>
              create.mutate(
                { dossierType: type },
                {
                  onSuccess: (res: unknown) => {
                    const id = (res as { dossier?: { id: string } })?.dossier?.id;
                    if (id) router.push(`/dossiers/${id}`);
                    else router.push("/dossiers/mes");
                  },
                },
              )
            }
          >
            {create.isPending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4 text-white" />
                Création en cours…
              </span>
            ) : (
              "Démarrer"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function Dot({ on }: { on: boolean }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${on ? "bg-[#2563EB]" : "bg-gray-300"}`} />;
}

function CardButton({
  title,
  subtitle,
  icon,
  selected,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ${
        selected ? "ring-[#2563EB]" : "ring-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F9FAFB] text-xl">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[#111827]">{title}</div>
          <div className="mt-1 text-xs text-[#374151]">{subtitle}</div>
        </div>
        <div className="text-lg text-gray-300">{selected ? "✓" : "›"}</div>
      </div>
    </button>
  );
}

