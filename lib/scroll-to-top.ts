const handlers = new Map<string, () => void>();

export function registerScrollToTop(key: string, handler: () => void) {
  handlers.set(key, handler);

  return () => {
    const existing = handlers.get(key);
    if (existing === handler) handlers.delete(key);
  };
}

export function scrollToTop(key: string) {
  handlers.get(key)?.();
}
