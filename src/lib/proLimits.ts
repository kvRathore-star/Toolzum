export const PRO_LIMITS = {
  dailyQr: 5,
  proQrMax: 100,
  dailyIcon: 5,
  proIconMax: 100,
  dailyCrop: 3,
  freeBatchSize: 5,
  proBatchSize: 100,
  maxConcurrentFree: 1,
  maxConcurrentPro: 4,
} as const;

export const PRO_LIMIT_MESSAGES = {
  dailyQrRemaining: (n: number) => `${n} / ${PRO_LIMITS.dailyQr} remaining`,
  dailyQrUpgrade: `Free tier limited to ${PRO_LIMITS.dailyQr} QR/day. Upgrade to Pro for up to ${PRO_LIMITS.proQrMax} per batch.`,
  freeBatchUpgrade: `Free tier limited to ${PRO_LIMITS.freeBatchSize} files. Upgrade to Pro for up to ${PRO_LIMITS.proBatchSize}.`,
} as const;
