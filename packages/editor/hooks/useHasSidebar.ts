import { useEffect, useLayoutEffect, useRef, useState } from "react";

const editorSidebarBreakPoint = 800;

export const useHasSidebar = (): [React.RefObject<HTMLDivElement>, boolean] => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasSidebar, setHasSidebar] = useState(false);

  useLayoutEffect(() => {
    if (ref.current) {
      const { width } = ref.current.getBoundingClientRect();
      if (width > editorSidebarBreakPoint) {
        setHasSidebar(true);
      } else {
        setHasSidebar(false);
      }
    }
  }, []);

  const handleResize = (entries: ResizeObserverEntry[]) => {
    const [entry] = entries;

    if (entry.contentRect.width > editorSidebarBreakPoint) {
      setHasSidebar(true);
    } else {
      setHasSidebar(false);
    }
  };

  const [resizeObserver] = useState(() => new ResizeObserver(handleResize));

  useEffect(() => {
    if (!resizeObserver) return;
    if (ref?.current) resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [ref, resizeObserver]);

  return [ref, hasSidebar];
};
