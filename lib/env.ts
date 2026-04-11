import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  MAX_FILE_BYTES: z.coerce.number().default(10 * 1024 * 1024),
  UPLOAD_DIR: z.string().default("./uploads"),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

export function getEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Variables d'environnement invalides");
  }
  return parsed.data;
}
