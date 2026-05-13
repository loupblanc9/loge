import { z } from "zod";

const schema = z
  .object({
    /** Pooler / app (ex. Supabase :6543 + pgbouncer) */
    DATABASE_URL: z
      .string({ error: "DATABASE_URL manquante — ajoutez-la dans Vercel (Settings → Environment Variables)." })
      .min(1, "DATABASE_URL vide."),
    /** Directe Prisma / migrations (ex. Supabase db.*.supabase.co :5432) */
    DIRECT_URL: z
      .string({ error: "DIRECT_URL manquante — obligatoire pour Prisma (Supabase : connexion directe)." })
      .min(1, "DIRECT_URL vide."),
    JWT_SECRET: z
      .string({ error: "JWT_SECRET manquant — sans lui, login et cookies JWT échouent (32+ caractères)." })
      .min(32, "JWT_SECRET trop court (minimum 32 caractères)."),
    MAX_FILE_BYTES: z.coerce.number().default(10 * 1024 * 1024),
    UPLOAD_DIR: z.string().default("./uploads"),
    STORAGE_DRIVER: z.enum(["local", "s3", "supabase"]).default("local"),
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_BASE_URL: z.string().optional(),
    /** Projet Supabase — URL publique https://xxxx.supabase.co */
    SUPABASE_URL: z.string().optional(),
    /** Clé service rôle — uniquement serveur (upload / signed URLs / proxy fichier) */
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    /** Bucket privé (défaut : documents) */
    SUPABASE_STORAGE_BUCKET: z.string().default("documents"),
    JWT_ISSUER: z.string().optional(),
    JWT_AUDIENCE: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER === "supabase") {
      if (!env.SUPABASE_URL?.trim()) {
        ctx.addIssue({
          code: "custom",
          message:
            "SUPABASE_URL manquante alors que STORAGE_DRIVER=supabase — copiez l’URL projet (Supabase → Settings → API).",
          path: ["SUPABASE_URL"],
        });
      }
      if (!env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
        ctx.addIssue({
          code: "custom",
          message:
            "SUPABASE_SERVICE_ROLE_KEY manquante alors que STORAGE_DRIVER=supabase — clé service_role (Supabase → Settings → API), jamais dans NEXT_PUBLIC_*.",
          path: ["SUPABASE_SERVICE_ROLE_KEY"],
        });
      }
    }
    if (env.STORAGE_DRIVER === "s3") {
      if (!env.S3_BUCKET?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "S3_BUCKET manquant alors que STORAGE_DRIVER=s3.",
          path: ["S3_BUCKET"],
        });
      }
      if (!env.S3_REGION?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "S3_REGION manquant alors que STORAGE_DRIVER=s3.",
          path: ["S3_REGION"],
        });
      }
      if (!env.S3_ACCESS_KEY_ID?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "S3_ACCESS_KEY_ID manquant alors que STORAGE_DRIVER=s3.",
          path: ["S3_ACCESS_KEY_ID"],
        });
      }
      if (!env.S3_SECRET_ACCESS_KEY?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "S3_SECRET_ACCESS_KEY manquant alors que STORAGE_DRIVER=s3.",
          path: ["S3_SECRET_ACCESS_KEY"],
        });
      }
    }
  });

export type Env = z.infer<typeof schema>;

function formatEnvFailure(flat: z.inferFlattenedErrors<typeof schema>) {
  const fieldMsgs = Object.entries(flat.fieldErrors)
    .filter(([, v]) => v && v.length)
    .map(([k, v]) => `${k}: ${(v as string[]).join(" ")}`);
  const formMsgs = flat.formErrors?.length ? flat.formErrors : [];
  return [...fieldMsgs, ...formMsgs].filter(Boolean).join(" | ");
}

/**
 * Variables d’environnement serveur. En cas d’erreur, message explicite (évite un 500 silencieux côté debug).
 */
export function getEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const detail = formatEnvFailure(flat) || parsed.error.message;
    const msg = `Configuration serveur: ${detail}`;
    console.error("[env]", msg, flat.fieldErrors);
    throw new Error(msg);
  }
  return parsed.data;
}
