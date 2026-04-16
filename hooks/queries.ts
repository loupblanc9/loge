"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, buildDossiersQuery } from "@/lib/api/client";
import type {
  DossierDetail,
  DossiersListResponse,
  DossierListItem,
  SessionUser,
  Tag,
} from "@/types/api";

export const qk = {
  me: ["me"] as const,
  dossiers: (qs: string) => ["dossiers", qs] as const,
  dossier: (id: string) => ["dossier", id] as const,
  tags: ["tags"] as const,
  search: (q: string) => ["search", q] as const,
};

export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      const r = await apiFetch<{ user: SessionUser | null }>("/api/auth/me");
      return r.user;
    },
    retry: false,
  });
}

export function useDossiersList(apiQueryString: string) {
  return useQuery({
    queryKey: qk.dossiers(apiQueryString),
    queryFn: () =>
      apiFetch<DossiersListResponse>(`/api/dossiers${apiQueryString ? `?${apiQueryString}` : ""}`),
  });
}

export function useDossier(id: string | null) {
  return useQuery({
    queryKey: qk.dossier(id ?? ""),
    queryFn: () => apiFetch<{ dossier: DossierDetail }>(`/api/dossiers/${id}`),
    enabled: !!id,
  });
}

export function useTags() {
  return useQuery({
    queryKey: qk.tags,
    queryFn: () => apiFetch<{ tags: Tag[] }>("/api/tags"),
  });
}

export function useSearchQuery(q: string) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: qk.search(trimmed),
    queryFn: () => apiFetch<{ data: DossierListItem[] }>(`/api/search?q=${encodeURIComponent(trimmed)}`),
    enabled: trimmed.length >= 2,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
    onSuccess: () => qc.clear(),
  });
}

export function useCreateDossier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title?: string; dossierType?: "social" | "prive" }) =>
      apiFetch("/api/dossiers", { method: "POST", json: body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dossiers"] }),
  });
}

export function useMarkDossierOpen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/dossiers/${id}/open`, { method: "POST" }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: qk.dossier(id) });
      qc.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}

export function usePatchDocument(dossierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      status,
    }: {
      docId: string;
      status: "missing" | "uploaded" | "approved" | "rejected";
    }) =>
      apiFetch(`/api/dossiers/${dossierId}/documents/${docId}`, {
        method: "PATCH",
        json: { status },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dossier(dossierId) });
      qc.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}

export function usePatchGuarantorDocument(dossierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      guarantorId,
      docId,
      status,
    }: {
      guarantorId: string;
      docId: string;
      status: "missing" | "uploaded" | "approved" | "rejected";
    }) =>
      apiFetch(`/api/guarantors/${guarantorId}/documents/${docId}`, {
        method: "PATCH",
        json: { status },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dossier(dossierId) });
      qc.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}

export function useUploadTenantDoc(dossierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ docId, file }: { docId: string; file: File }) => {
      const fd = new FormData();
      fd.set("file", file);
      return apiFetch(`/api/dossiers/${dossierId}/documents/${docId}`, { method: "POST", body: fd });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dossier(dossierId) });
      qc.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}

export function useUploadGuarantorDoc(dossierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      guarantorId,
      docId,
      file,
    }: {
      guarantorId: string;
      docId: string;
      file: File;
    }) => {
      const fd = new FormData();
      fd.set("file", file);
      return apiFetch(`/api/guarantors/${guarantorId}/documents/${docId}`, { method: "POST", body: fd });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dossier(dossierId) });
      qc.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}

export function useBulkDocs(dossierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: "approveAll" | "rejectAllUploaded") =>
      apiFetch(`/api/dossiers/${dossierId}/documents/bulk`, {
        method: "POST",
        json: { action },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dossier(dossierId) });
      qc.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}

export function useDossierTag(dossierId: string) {
  const qc = useQueryClient();
  const attach = useMutation({
    mutationFn: (tagId: string) =>
      apiFetch(`/api/dossiers/${dossierId}/tags`, { method: "POST", json: { tagId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dossier(dossierId) });
      qc.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
  const detach = useMutation({
    mutationFn: (tagId: string) =>
      apiFetch(`/api/dossiers/${dossierId}/tags?tagId=${encodeURIComponent(tagId)}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dossier(dossierId) });
      qc.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
  return { attach, detach };
}

export function useAdminBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch("/api/admin/dossiers/bulk", { method: "POST", json: body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dossiers"] }),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; color: string }) =>
      apiFetch("/api/tags", { method: "POST", json: body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tags }),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; color?: string }) =>
      apiFetch(`/api/tags/${id}`, { method: "PATCH", json: body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tags }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/tags/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tags }),
  });
}

export function useNotes(dossierId: string, enabled = true) {
  return useQuery({
    queryKey: ["notes", dossierId],
    queryFn: () => apiFetch<{ notes: import("@/types/api").Note[] }>(`/api/dossiers/${dossierId}/notes`),
    enabled: !!dossierId && enabled,
    retry: false,
  });
}

export function useCreateGuarantor(dossierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name?: string }) =>
      apiFetch(`/api/dossiers/${dossierId}/guarantors`, { method: "POST", json: body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dossier(dossierId) });
      qc.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}

export function useAddNote(dossierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/api/dossiers/${dossierId}/notes`, { method: "POST", json: { content } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", dossierId] }),
  });
}

export { buildDossiersQuery };
