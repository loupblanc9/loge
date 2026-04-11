import type { DossierStatus } from "@/types/api";

/** Libellés & couleurs alignés maquettes (Validé, Envoyé, Refusé, Manquant, En cours…) */
export function dossierStatusUi(status: DossierStatus, progress: number) {
  if (status === "complete") {
    return { label: "Validé", className: "bg-emerald-50 text-[#16A34A] ring-1 ring-emerald-200" };
  }
  if (status === "review") {
    if (progress > 0) {
      return { label: "En cours", className: "bg-amber-50 text-[#F59E0B] ring-1 ring-amber-200" };
    }
    return { label: "Envoyé", className: "bg-blue-50 text-[#2563EB] ring-1 ring-blue-200" };
  }
  return {
    label: progress === 0 && status === "incomplete" ? "Manquant" : "Incomplet",
    className: "bg-gray-100 text-[#9CA3AF] ring-1 ring-gray-200",
  };
}

export function documentStatusUi(status: import("@/types/api").DocumentStatus) {
  switch (status) {
    case "approved":
      return { label: "Validé", className: "bg-emerald-50 text-[#16A34A] ring-1 ring-emerald-200" };
    case "uploaded":
      return { label: "En attente", className: "bg-amber-50 text-[#F59E0B] ring-1 ring-amber-200" };
    case "rejected":
      return { label: "Refusé", className: "bg-red-50 text-[#DC2626] ring-1 ring-red-200" };
    default:
      return { label: "Manquant", className: "bg-gray-100 text-[#9CA3AF] ring-1 ring-gray-200" };
  }
}
