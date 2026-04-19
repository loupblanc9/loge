/**
 * Dans les route handlers Next.js/Node, l’entrée `formData().get("file")` n’est pas
 * toujours reconnue par `instanceof File` (plusieurs implémentations globales).
 * On accepte tout Blob exposant arrayBuffer + éventuellement `name` / `type`.
 */
export function getFormDataFileBlob(form: FormData, key: string): Blob | null {
  const v = form.get(key);
  if (!v || typeof v !== "object") return null;
  if (typeof (v as Blob).arrayBuffer !== "function") return null;
  return v as Blob;
}

export function uploadOriginalName(blob: Blob): string {
  if ("name" in blob && typeof (blob as File).name === "string" && (blob as File).name.trim()) {
    return (blob as File).name.trim();
  }
  return "document";
}

export function uploadDeclaredMime(blob: Blob): string {
  if ("type" in blob && typeof (blob as File).type === "string") return (blob as File).type;
  return "";
}
