export type StoredObjectMeta = {
  key: string;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
};

export interface FileStorage {
  put(buffer: Buffer, meta: Omit<StoredObjectMeta, "key"> & { key?: string }): Promise<{ key: string; publicUrl: string }>;
  getReadStream(key: string): Promise<NodeJS.ReadableStream>;
  delete(key: string): Promise<void>;
}
