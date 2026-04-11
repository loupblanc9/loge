-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'admin');

-- CreateEnum
CREATE TYPE "DossierStatus" AS ENUM ('incomplete', 'review', 'complete');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('missing', 'uploaded', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "DocumentPriority" AS ENUM ('normal', 'high');

-- CreateTable
CREATE TABLE "DossierSequence" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "value" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DossierSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'client',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dossier" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "status" "DossierStatus" NOT NULL DEFAULT 'incomplete',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isOpened" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Dossier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "status" "DocumentStatus" NOT NULL DEFAULT 'missing',
    "priority" "DocumentPriority" NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guarantor" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guarantor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuarantorDocument" (
    "id" TEXT NOT NULL,
    "guarantorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "status" "DocumentStatus" NOT NULL DEFAULT 'missing',
    "priority" "DocumentPriority" NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GuarantorDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DossierTag" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "DossierTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE UNIQUE INDEX "Dossier_reference_key" ON "Dossier"("reference");
CREATE INDEX "Dossier_userId_idx" ON "Dossier"("userId");
CREATE INDEX "Dossier_status_idx" ON "Dossier"("status");
CREATE INDEX "Dossier_progress_idx" ON "Dossier"("progress");
CREATE INDEX "Dossier_isOpened_idx" ON "Dossier"("isOpened");
CREATE INDEX "Dossier_createdAt_idx" ON "Dossier"("createdAt");
CREATE INDEX "Dossier_updatedAt_idx" ON "Dossier"("updatedAt");
CREATE INDEX "Dossier_status_updatedAt_idx" ON "Dossier"("status", "updatedAt");
CREATE INDEX "Dossier_userId_status_idx" ON "Dossier"("userId", "status");
CREATE INDEX "Document_dossierId_idx" ON "Document"("dossierId");
CREATE INDEX "Document_status_idx" ON "Document"("status");
CREATE INDEX "Document_dossierId_status_idx" ON "Document"("dossierId", "status");
CREATE UNIQUE INDEX "Document_dossierId_type_key" ON "Document"("dossierId", "type");
CREATE INDEX "Guarantor_dossierId_idx" ON "Guarantor"("dossierId");
CREATE INDEX "GuarantorDocument_guarantorId_idx" ON "GuarantorDocument"("guarantorId");
CREATE INDEX "GuarantorDocument_status_idx" ON "GuarantorDocument"("status");
CREATE UNIQUE INDEX "GuarantorDocument_guarantorId_type_key" ON "GuarantorDocument"("guarantorId", "type");
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
CREATE INDEX "Tag_name_idx" ON "Tag"("name");
CREATE INDEX "DossierTag_dossierId_idx" ON "DossierTag"("dossierId");
CREATE INDEX "DossierTag_tagId_idx" ON "DossierTag"("tagId");
CREATE UNIQUE INDEX "DossierTag_dossierId_tagId_key" ON "DossierTag"("dossierId", "tagId");
CREATE INDEX "Note_dossierId_idx" ON "Note"("dossierId");
CREATE INDEX "Note_authorId_idx" ON "Note"("authorId");

ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Guarantor" ADD CONSTRAINT "Guarantor_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuarantorDocument" ADD CONSTRAINT "GuarantorDocument_guarantorId_fkey" FOREIGN KEY ("guarantorId") REFERENCES "Guarantor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DossierTag" ADD CONSTRAINT "DossierTag_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DossierTag" ADD CONSTRAINT "DossierTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Recherche rapide (référence dossier, email, nom locataire — maquette)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "Dossier_reference_trgm_idx" ON "Dossier" USING gin ("reference" gin_trgm_ops);
CREATE INDEX "User_email_trgm_idx" ON "User" USING gin ("email" gin_trgm_ops);
CREATE INDEX "User_name_trgm_idx" ON "User" USING gin ("name" gin_trgm_ops);
CREATE INDEX "Dossier_title_trgm_idx" ON "Dossier" USING gin ("title" gin_trgm_ops);
