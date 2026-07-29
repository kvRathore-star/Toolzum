export function createDownloadBlob(data: Uint8Array | string, mime: string): Blob {
  return new Blob([data as unknown as BlobPart], { type: mime });
}
