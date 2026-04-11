import type { FileStorage } from "@/lib/storage/types";
import { LocalFileStorage } from "@/lib/storage/local-storage";
import { S3FileStorage } from "@/lib/storage/s3-storage";
import { getEnv } from "@/lib/env";

let cached: FileStorage | null = null;

export function getStorage(): FileStorage {
  if (cached) return cached;
  const driver = getEnv().STORAGE_DRIVER;
  cached = driver === "s3" ? new S3FileStorage() : new LocalFileStorage();
  return cached;
}
