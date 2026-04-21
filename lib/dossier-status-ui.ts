import type { DossierStatus } from "@/types/api";
import { dossierStatusLabelFr } from "@/lib/constants/dossier-status";

type StatusUi = { label: string; className: string };

/** Badges lisibles côté liste et fiche — alignés produit DOMICIAL */
export function dossierStatusUi(status: DossierStatus, progress: number): StatusUi {
  switch (status) {
    case "pending":
      return {
        label: dossierStatusLabelFr.pending,
        className: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
      };
    case "incomplete":
      return {
        label: progress === 0 ? "Manquant" : dossierStatusLabelFr.incomplete,
        className: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
      };
    case "in_review":
      return {
        label: dossierStatusLabelFr.in_review,
        className: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
      };
    case "validated":
      return {
        label: dossierStatusLabelFr.validated,
        className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      };
    case "rejected":
      return {
        label: dossierStatusLabelFr.rejected,
        className: "bg-red-50 text-red-700 ring-1 ring-red-200",
      };
  }
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
