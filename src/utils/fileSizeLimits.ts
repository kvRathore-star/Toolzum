export interface CategoryLimits {
  signed: number;
  free: number;
}

export function smartMax(accept: string): CategoryLimits {
  if (accept.includes('video/')) return { signed: 150, free: 30 };
  if (accept.includes('application/pdf')) return { signed: 40, free: 15 };
  if (accept.includes('audio/')) return { signed: 50, free: 20 };
  return { signed: 20, free: 10 };
}
