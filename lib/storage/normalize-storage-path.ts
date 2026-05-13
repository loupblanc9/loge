/**
 * Nettoie la clé objet telle qu’attendue par `storage.from(bucket)` :
 * pas de slash en tête, pas de préfixe `{bucket}/` par erreur.
 */
export function normalizeStorageObjectKey(storagePath: string, bucketName?: string): string {
  let s = storagePath.trim().replace(/^\/+/, "");
  const b = bucketName?.trim().replace(/\/+$/, "");
  if (b && s.startsWith(`${b}/`)) {
    s = s.slice(b.length + 1);
  }
  return s;
}
