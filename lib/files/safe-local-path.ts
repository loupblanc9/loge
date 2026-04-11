import path from "path";
import { getEnv } from "@/lib/env";

/** Empêche la traversée de répertoire pour le stockage local. */
export function resolveSafeUploadPath(segments: string[]): string | null {
  const base = path.resolve(process.cwd(), getEnv().UPLOAD_DIR);
  const joined = path.resolve(base, ...segments.map(decodeURIComponent));
  if (!joined.startsWith(base)) return null;
  return joined;
}
