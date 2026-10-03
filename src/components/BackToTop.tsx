"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(32);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);

      // When near the page bottom, push the button up so it stays above the edge
      const distanceFromBottom = document.body.scrollHeight - window.innerHeight - window.scrollY;
      if (distanceFromBottom < 80) {
        setBottomOffset(32 + (80 - distanceFromBottom));
      } else {
        setBottomOffset(32);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="transition-all duration-300 ease-out"
      style={{
        position: "fixed",
        bottom: bottomOffset,
        left: "50%",
        transform: `translateX(-50%) scale(${visible ? 1 : 0.6})`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "10px 20px",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: "var(--color-accent)",
        color: "var(--color-bg)",
        fontFamily: "var(--font-creepster), cursive",
        fontSize: 16,
        letterSpacing: "0.04em",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      <ArrowUp size={16} weight="bold" />
      Back to top
    </button>
  );
}
