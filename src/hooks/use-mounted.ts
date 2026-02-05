"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only after the component has mounted on the client.
 * Use this to gate rendering of store-dependent UI to avoid
 * SSR/client hydration mismatches with Zustand persist.
 *
 * @example
 * ```tsx
 * const mounted = useMounted();
 * if (!mounted) return <Skeleton />;
 * // Safe to read from persisted store here
 * ```
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
