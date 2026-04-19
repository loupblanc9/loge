import type { DocumentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { getStorage } from "@/lib/storage/factory";
import { recalculateDossier } from "@/services/dossier-metadata.service";

const ALLOWED_MIME = new Set(["application/pdf", "image/jpeg", "image/png"]);

export function assertAllowedUpload(mimeType: string, size: number) {
  const env = getEnv();
  if (!ALLOWED_MIME.has(mimeType)) {
    throw Object.assign(new Error("Format non autorisé (PDF, JPG, PNG uniquement)"), { status: 400 });
  }
  if (size > env.MAX_FILE_BYTES) {
    throw Object.assign(new Error(`Fichier trop volumineux (max ${env.MAX_FILE_BYTES} octets)`), { status: 400 });
  }
}

function hasKnownSignature(mimeType: string, buffer: Buffer): boolean {
  if (mimeType === "application/pdf") {
    return buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "%PDF";
  }
  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return buffer.length >= 8 && pngSig.every((b, i) => buffer[i] === b);
  }
  return false;
}

function detectMimeFromBuffer(buffer: Buffer): string | null {
  if (buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "%PDF") return "application/pdf";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length >= 8 && pngSig.every((b, i) => buffer[i] === b)) return "image/png";
  return null;
}

function mimeFromExtension(originalName: string): string | null {
  const m = originalName.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!m) return null;
  switch (m[1]) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    default:
      return null;
  }
}

function normalizeDeclaredMime(m: string): string {
  const t = m.trim().toLowerCase();
  if (t === "image/jpg") return "image/jpeg";
  return t;
}

/** Déclaration navigateur souvent vide ou `application/octet-stream` sur mobile — on s’appuie sur les magic bytes. */
export function resolveMimeForUpload(buffer: Buffer, declaredMime: string, originalName: string): string {
  const declared = normalizeDeclaredMime(declaredMime);
  const detected = detectMimeFromBuffer(buffer);
  const fromExt = mimeFromExtension(originalName);

  const candidates: string[] = [];
  if (detected) candidates.push(detected);
  if (declared && declared !== "application/octet-stream") candidates.push(declared);
  if (fromExt) candidates.push(fromExt);

  const seen = new Set<string>();
  for (const mime of candidates) {
    if (!mime || seen.has(mime)) continue;
    seen.add(mime);
    if (!ALLOWED_MIME.has(mime)) continue;
    if (!hasKnownSignature(mime, buffer)) continue;
    return mime;
  }

  throw Object.assign(new Error("Format non autorisé ou fichier non reconnu (PDF, JPG, PNG uniquement)"), {
    status: 400,
  });
}

function extractKeyFromFileUrl(fileUrl: string): string | null {
  if (!fileUrl.startsWith("/api/files/")) return null;
  try {
    return decodeURIComponent(fileUrl.replace(/^\/api\/files\//, ""));
  } catch {
    return null;
  }
}

export async function uploadTenantDocument(
  dossierId: string,
  documentId: string,
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  opts: { userId: string; admin: boolean },
) {
  const resolvedMime = resolveMimeForUpload(buffer, mimeType, originalName);
  assertAllowedUpload(resolvedMime, buffer.length);

  const dossier = await prisma.dossier.findUnique({
    where: { id: dossierId },
    include: { documents: true },
  });
  if (!dossier) return { error: "NOT_FOUND" as const };
  if (!opts.admin && dossier.userId !== opts.userId) return { error: "FORBIDDEN" as const };

  const doc = dossier.documents.find((d) => d.id === documentId);
  if (!doc) return { error: "NOT_FOUND" as const };

  if (doc.fileUrl) {
    const oldKey = extractKeyFromFileUrl(doc.fileUrl);
    if (oldKey) await getStorage().delete(oldKey).catch(() => {});
  }

  const storage = getStorage();
  const { key, publicUrl } = await storage.put(buffer, {
    mimeType: resolvedMime,
    sizeBytes: buffer.length,
    originalName,
    key: `${dossierId}/tenant/${documentId}-${originalName.replace(/[^\w.-]/g, "_")}`,
  });

  await prisma.document.update({
    where: { id: documentId },
    data: {
      fileUrl: publicUrl,
      fileName: originalName,
      mimeType: resolvedMime,
      sizeBytes: buffer.length,
      status: "uploaded",
    },
  });

  await recalculateDossier(dossierId);
  return { ok: true as const, fileUrl: publicUrl, key };
}

export async function setTenantDocumentStatus(
  dossierId: string,
  documentId: string,
  status: DocumentStatus,
  opts: { admin: boolean },
) {
  if (!opts.admin) {
    throw Object.assign(new Error("FORBIDDEN"), { status: 403 });
  }
  const doc = await prisma.document.findFirst({
    where: { id: documentId, dossierId },
  });
  if (!doc) return null;

  const data: Prisma.DocumentUpdateInput = { status };
  if (status === "missing") {
    data.fileUrl = null;
    data.fileName = null;
    data.mimeType = null;
    data.sizeBytes = null;
    if (doc.fileUrl) {
      const k = extractKeyFromFileUrl(doc.fileUrl);
      if (k) await getStorage().delete(k).catch(() => {});
    }
  }

  await prisma.document.update({ where: { id: documentId }, data });
  await recalculateDossier(dossierId);
  return prisma.document.findUnique({ where: { id: documentId } });
}

export async function uploadGuarantorDocument(
  guarantorId: string,
  documentId: string,
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  opts: { userId: string; admin: boolean },
) {
  const resolvedMime = resolveMimeForUpload(buffer, mimeType, originalName);
  assertAllowedUpload(resolvedMime, buffer.length);

  const guarantor = await prisma.guarantor.findUnique({
    where: { id: guarantorId },
    include: { dossier: true, documents: true },
  });
  if (!guarantor) return { error: "NOT_FOUND" as const };
  if (!opts.admin && guarantor.dossier.userId !== opts.userId) return { error: "FORBIDDEN" as const };

  const doc = guarantor.documents.find((d) => d.id === documentId);
  if (!doc) return { error: "NOT_FOUND" as const };

  if (doc.fileUrl) {
    const oldKey = extractKeyFromFileUrl(doc.fileUrl);
    if (oldKey) await getStorage().delete(oldKey).catch(() => {});
  }

  const storage = getStorage();
  const { publicUrl } = await storage.put(buffer, {
    mimeType: resolvedMime,
    sizeBytes: buffer.length,
    originalName,
    key: `${guarantor.dossierId}/guarantor/${guarantorId}/${documentId}-${originalName.replace(/[^\w.-]/g, "_")}`,
  });

  await prisma.guarantorDocument.update({
    where: { id: documentId },
    data: {
      fileUrl: publicUrl,
      fileName: originalName,
      mimeType: resolvedMime,
      sizeBytes: buffer.length,
      status: "uploaded",
    },
  });

  await recalculateDossier(guarantor.dossierId);
  return { ok: true as const, fileUrl: publicUrl };
}

export async function setGuarantorDocumentStatus(
  guarantorId: string,
  documentId: string,
  status: DocumentStatus,
  opts: { admin: boolean },
) {
  if (!opts.admin) {
    throw Object.assign(new Error("FORBIDDEN"), { status: 403 });
  }
  const doc = await prisma.guarantorDocument.findFirst({
    where: { id: documentId, guarantorId },
    include: { guarantor: true },
  });
  if (!doc) return null;

  const data: Prisma.GuarantorDocumentUpdateInput = { status };
  if (status === "missing") {
    data.fileUrl = null;
    data.fileName = null;
    data.mimeType = null;
    data.sizeBytes = null;
    if (doc.fileUrl) {
      const k = extractKeyFromFileUrl(doc.fileUrl);
      if (k) await getStorage().delete(k).catch(() => {});
    }
  }

  await prisma.guarantorDocument.update({ where: { id: documentId }, data });
  await recalculateDossier(doc.guarantor.dossierId);
  return prisma.guarantorDocument.findUnique({ where: { id: documentId } });
}

export async function approveAllDocuments(dossierId: string, opts: { admin: boolean }) {
  if (!opts.admin) throw Object.assign(new Error("FORBIDDEN"), { status: 403 });
  await prisma.$transaction([
    prisma.document.updateMany({
      where: { dossierId, status: { in: ["uploaded", "rejected"] } },
      data: { status: "approved" },
    }),
    prisma.guarantorDocument.updateMany({
      where: { guarantor: { dossierId }, status: { in: ["uploaded", "rejected"] } },
      data: { status: "approved" },
    }),
  ]);
  await recalculateDossier(dossierId);
}

export async function rejectAllUploadedDocuments(dossierId: string, opts: { admin: boolean }) {
  if (!opts.admin) throw Object.assign(new Error("FORBIDDEN"), { status: 403 });
  await prisma.$transaction([
    prisma.document.updateMany({
      where: { dossierId, status: "uploaded" },
      data: { status: "rejected" },
    }),
    prisma.guarantorDocument.updateMany({
      where: { guarantor: { dossierId }, status: "uploaded" },
      data: { status: "rejected" },
    }),
  ]);
  await recalculateDossier(dossierId);
}
