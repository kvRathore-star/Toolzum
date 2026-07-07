import { toast } from 'react-hot-toast';

interface ErrorHandlingOptions {
  toast?: string;
  fallback?: unknown;
  log?: boolean;
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: ErrorHandlingOptions = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    if (options.log && typeof e === 'object' && e !== null) {
      console.error('[toolhub]', e);
    }
    if (options.toast) {
      toast.error(options.toast);
    }
    return (options.fallback as T) ?? null;
  }
}
