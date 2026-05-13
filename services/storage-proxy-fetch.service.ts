import { createSupabaseSignedUrl } from "@/services/storage-signed-url.service";

/**
 * Récupère le flux HTTP vers l’objet Storage (URL signée côté serveur, sans CORS navigateur).
 */
export async function fetchSupabaseObjectResponse(
  storagePath: string,
  opts?: { download?: boolean; fileName?: string },
): Promise<Response | { error: string }> {
  const signed = await createSupabaseSignedUrl(storagePath, {
    ttlSec: 120,
    download: opts?.download === true,
    fileName: opts?.fileName,
  });
  if ("error" in signed) {
    return { error: signed.error };
  }
  const upstream = await fetch(signed.signedUrl, { cache: "no-store" });
  if (!upstream.ok) {
    return { error: `Stockage distant ${upstream.status}` };
  }
  return upstream;
}
