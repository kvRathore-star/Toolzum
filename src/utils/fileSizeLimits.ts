export interface CategoryLimits {
  signed: number;
  free: number;
}

export function smartMax(accept: string): CategoryLimits {
  if (accept.includes('video/')) return { signed: 500, free: 50 };
  if (accept.includes('application/pdf')) return { signed: 50, free: 20 };
  if (accept.includes('audio/')) return { signed: 100, free: 50 };
  return { signed: 20, free: 10 };
}
