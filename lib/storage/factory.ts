import type { FileStorage } from "@/lib/storage/types";
import { LocalFileStorage } from "@/lib/storage/local-storage";
import { S3FileStorage } from "@/lib/storage/s3-storage";
import { getEnv } from "@/lib/env";

let cached: FileStorage | null = null;

export function getStorage(): FileStorage {
  if (cached) return cached;
  const env = getEnv();
  if (env.STORAGE_DRIVER === "s3") {
    if (!env.S3_BUCKET || !env.S3_REGION || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      throw Object.assign(
        new Error(
          "Configuration S3 incomplète sur le serveur. Renseignez S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY — ou utilisez STORAGE_DRIVER=local (fichiers dans /tmp sur Vercel).",
        ),
        { status: 503 },
      );
    }
    cached = new S3FileStorage();
  } else {
    cached = new LocalFileStorage();
  }
  return cached;
}
