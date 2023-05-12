import type { MutableRefObject } from "react";
import { useEffect } from "react";

export const useMutationObserver = (
  ref: MutableRefObject<Element | null | undefined>,
  callback: MutationCallback,
  options: MutationObserverInit = {}
) => {
  useEffect(() => {
    if (ref.current) {
      const observer = new MutationObserver(callback);
      observer.observe(ref.current, options);
      return () => observer.disconnect();
    }
  }, [callback, options]);
};
