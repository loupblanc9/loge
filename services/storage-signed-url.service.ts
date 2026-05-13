import { getEnv } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeStorageObjectKey } from "@/lib/storage/normalize-storage-path";

const DEFAULT_TTL_SEC = 3600;

export async function createSupabaseSignedUrl(
  storagePath: string,
  opts?: { ttlSec?: number; download?: boolean; fileName?: string },
): Promise<{ signedUrl: string; expiresAt: number } | { error: string }> {
  const env = getEnv();
  if (env.STORAGE_DRIVER !== "supabase") {
    return { error: "Signed URLs disponibles uniquement avec STORAGE_DRIVER=supabase" };
  }
  const ttl = opts?.ttlSec ?? DEFAULT_TTL_SEC;
  const bucket = env.SUPABASE_STORAGE_BUCKET || "documents";
  const supabase = getSupabaseAdmin();

  const key = normalizeStorageObjectKey(storagePath, bucket);
  if (process.env.NODE_ENV !== "production") {
    console.info("[signed-url] storagePath raw =", storagePath, "| normalized key =", key);
  }

  const wantDownload = opts?.download === true;
  const fileName = opts?.fileName?.replace(/[^\w.\- ()]/g, "_");

  const signOpts = wantDownload ? { download: (fileName ?? true) as string | boolean } : undefined;

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(key, ttl, signOpts);

  if (error || !data?.signedUrl) {
    return { error: error?.message ?? "Impossible de générer l’URL signée" };
  }

  return { signedUrl: data.signedUrl, expiresAt: Math.floor(Date.now() / 1000) + ttl };
}
