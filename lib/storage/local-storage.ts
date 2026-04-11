import fs from "fs/promises";
import path from "path";
import { createReadStream } from "fs";
import { randomUUID } from "crypto";
import type { FileStorage, StoredObjectMeta } from "@/lib/storage/types";
import { getEnv } from "@/lib/env";

export class LocalFileStorage implements FileStorage {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), getEnv().UPLOAD_DIR);
  }

  async put(
    buffer: Buffer,
    meta: Omit<StoredObjectMeta, "key"> & { key?: string },
  ): Promise<{ key: string; publicUrl: string }> {
    const key = meta.key ?? `${randomUUID()}-${sanitize(meta.originalName)}`;
    const full = path.join(this.baseDir, key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, buffer);
    const publicUrl = `/api/files/${encodeURIComponent(key)}`;
    return { key, publicUrl };
  }

  async getReadStream(key: string): Promise<NodeJS.ReadableStream> {
    const full = path.join(this.baseDir, key);
    return createReadStream(full);
  }

  async delete(key: string): Promise<void> {
    const full = path.join(this.baseDir, key);
    await fs.unlink(full).catch(() => {});
  }
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}
