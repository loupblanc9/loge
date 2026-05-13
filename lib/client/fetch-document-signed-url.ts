import { documentSignedUrlPath } from "@/lib/client/document-signed-url";

/**
 * Appelle l’API Next (cookie session) et retourne l’URL signée Supabase uniquement.
 */
export async function fetchDocumentSignedUrl(
  opts: { dossierId: string; docId: string; guarantorId?: string | null },
  download: boolean,
): Promise<{ signedUrl: string; expiresAt: number }> {
  const path = documentSignedUrlPath(opts, download);
  const url = typeof window !== "undefined" ? new URL(path, window.location.origin).href : path;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  const raw = await res.text();
  let data: { signedUrl?: string; expiresAt?: number; error?: string };
  try {
    data = JSON.parse(raw) as { signedUrl?: string; expiresAt?: number; error?: string };
  } catch {
    throw new Error(raw.slice(0, 200) || "Réponse invalide (non JSON)");
  }

  if (!res.ok) {
    throw new Error(data.error ?? `Erreur ${res.status}`);
  }
  if (!data.signedUrl) {
    throw new Error(data.error ?? "signedUrl manquante");
  }

  return { signedUrl: data.signedUrl, expiresAt: data.expiresAt ?? 0 };
}
