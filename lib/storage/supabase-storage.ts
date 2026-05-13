import type { FileStorage, StoredObjectMeta } from "@/lib/storage/types";
import { getEnv } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Bucket privé Supabase Storage.
 * La clé d’objet doit suivre la convention métier : {userId}/{dossierId}/...
 */
export class SupabaseBucketStorage implements FileStorage {
  private bucket: string;

  constructor() {
    const env = getEnv();
    this.bucket = env.SUPABASE_STORAGE_BUCKET || "documents";
  }

  async put(
    buffer: Buffer,
    meta: Omit<StoredObjectMeta, "key"> & { key?: string },
  ): Promise<{ key: string; publicUrl: string }> {
    if (!meta.key) throw new Error("Chemin objet Supabase obligatoire (key)");
    const key = meta.key;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(this.bucket).upload(key, buffer, {
      contentType: meta.mimeType,
      upsert: true,
    });

    if (error) throw Object.assign(new Error(error.message || "Échec upload Storage"), { status: 502 });

    return { key, publicUrl: "" };
  }

  async delete(storagePath: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(this.bucket).remove([storagePath]);
    if (error && !error.message.includes("Not found")) {
      console.error("[SupabaseStorage] delete:", error.message);
    }
  }
}
