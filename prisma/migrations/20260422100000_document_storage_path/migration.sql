-- Chemin d’objet dans le bucket Supabase Storage « documents » (sans préfixe de bucket).
ALTER TABLE "Document" ADD COLUMN "storagePath" TEXT;

ALTER TABLE "GuarantorDocument" ADD COLUMN "storagePath" TEXT;
