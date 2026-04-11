import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import type { FileStorage, StoredObjectMeta } from "@/lib/storage/types";
import { getEnv } from "@/lib/env";

export class S3FileStorage implements FileStorage {
  private client: S3Client;
  private bucket: string;
  private publicBase: string;

  constructor() {
    const env = getEnv();
    if (!env.S3_BUCKET || !env.S3_REGION || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      throw new Error("Configuration S3 incomplète");
    }
    this.bucket = env.S3_BUCKET;
    this.publicBase = env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
    this.client = new S3Client({
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async put(
    buffer: Buffer,
    meta: Omit<StoredObjectMeta, "key"> & { key?: string },
  ): Promise<{ key: string; publicUrl: string }> {
    const key = meta.key ?? `uploads/${randomUUID()}-${meta.originalName.replace(/[^\w.-]/g, "_")}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: meta.mimeType,
      }),
    );
    const publicUrl = this.publicBase ? `${this.publicBase}/${key}` : `s3://${this.bucket}/${key}`;
    return { key, publicUrl };
  }

  async getReadStream(key: string): Promise<NodeJS.ReadableStream> {
    const out = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    if (!out.Body) throw new Error("Corps S3 illisible");
    const body = out.Body as AsyncIterable<Uint8Array>;
    return Readable.from(body, { objectMode: false });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
