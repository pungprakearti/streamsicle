"use client";

import { useRef, useCallback } from "react";

const HUES = [355, 18, 42, 68, 90, 125, 160, 188, 212, 240, 268];
const LETTERS = "Streamsicle".split("");

export function Logo({ size, fullWidth }: { size?: number; fullWidth?: boolean }) {
  const measured = useRef(false);

  const refCallback = useCallback(
    (el: HTMLHeadingElement | null) => {
      if (!el || !fullWidth || measured.current) return;
      measured.current = true;
      requestAnimationFrame(() => {
        const parent = el.parentElement;
        if (!parent) return;
        const containerWidth = parent.clientWidth;
        const naturalWidth = el.scrollWidth;
        if (naturalWidth > 0 && containerWidth > 0) {
          el.style.transform = `scaleX(${containerWidth / naturalWidth})`;
        }
      });
    },
    [fullWidth],
  );

  return (
    <h1
      ref={fullWidth ? refCallback : undefined}
      className="logo"
      style={{
        fontFamily: "var(--font-creepster), cursive",
        fontWeight: 400,
        fontSize: size,
        letterSpacing: "0.02em",
        margin: 0,
        lineHeight: 1,
        ...(fullWidth
          ? {
              transformOrigin: "left top",
              whiteSpace: "nowrap",
              display: "block",
              width: "max-content",
            }
          : {}),
      }}
      aria-label="Streamsicle"
    >
      {LETTERS.map((letter, i) => (
        <span key={i} style={{ color: `oklch(0.74 0.16 ${HUES[i]})` }}>
          {letter}
        </span>
      ))}
    </h1>
  );
}
