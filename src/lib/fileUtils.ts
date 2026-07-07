const LARGE_FILE_THRESHOLD_MB = 100;

export function hasLargeFiles(files: File[]): boolean {
  return files.some(f => f.size > LARGE_FILE_THRESHOLD_MB * 1024 * 1024);
}

export function checkMemory(): { low: boolean; available: string | null } {
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (mem && mem < 4) {
    return { low: true, available: `${mem}GB` };
  }
  return { low: false, available: mem ? `${mem}GB` : null };
}
