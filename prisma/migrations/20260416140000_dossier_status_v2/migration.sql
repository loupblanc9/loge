-- Statuts dossier DOMICIAL : en attente, incomplet, en vérification, validé, refusé
-- PostgreSQL 10+ : RENAME VALUE pour conserver les données existantes.

ALTER TYPE "DossierStatus" ADD VALUE 'pending';
ALTER TYPE "DossierStatus" ADD VALUE 'rejected';

ALTER TYPE "DossierStatus" RENAME VALUE 'review' TO 'in_review';
ALTER TYPE "DossierStatus" RENAME VALUE 'complete' TO 'validated';
