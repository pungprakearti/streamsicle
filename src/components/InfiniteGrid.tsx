"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const PAGE_SIZE = 48;

type Props = {
  totalCount: number;
  children: ReactNode[];
  /** Render sentinel as a <tr> for table layouts */
  tableMode?: boolean;
};

export function InfiniteGrid({ totalCount, children, tableMode = false }: Props) {
  const [visible, setVisible] = useState(Math.min(PAGE_SIZE, totalCount));
  const [prevCount, setPrevCount] = useState(totalCount);
  const sentinelRef = useRef<HTMLTableRowElement & HTMLDivElement>(null);

  // Reset when children change (render-time state update, not an effect)
  if (totalCount !== prevCount) {
    setPrevCount(totalCount);
    setVisible(Math.min(PAGE_SIZE, totalCount));
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visible >= totalCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((prev) => Math.min(prev + PAGE_SIZE, totalCount));
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visible, totalCount]);

  const showSentinel = visible < totalCount;

  return (
    <>
      {children.slice(0, visible)}
      {showSentinel && (
        tableMode ? (
          <tr ref={sentinelRef} style={{ height: 1 }}><td /></tr>
        ) : (
          <div ref={sentinelRef} style={{ height: 1 }} />
        )
      )}
    </>
  );
}
