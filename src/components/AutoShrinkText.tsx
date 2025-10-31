import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

type AutoShrinkTextProps = {
  children: string;
  className?: string;
  minFontSizePx?: number;
  maxFontSizePx?: number;
};

export const AutoShrinkText: React.FC<AutoShrinkTextProps> = ({
  children,
  className = "",
  minFontSizePx = 12,
  maxFontSizePx = 16,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [fontSize, setFontSize] = useState<number>(maxFontSizePx);

  const ro = useMemo(() => {
    if (typeof window === "undefined" || !("ResizeObserver" in window))
      return null;
    return new ResizeObserver(() => {
      adjust();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container && ro) {
      ro.observe(container);
    }
    return () => {
      if (container && ro) {
        ro.unobserve(container);
      }
    };
  }, [ro]);

  useLayoutEffect(() => {
    adjust();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, maxFontSizePx, minFontSizePx]);

  const adjust = () => {
    const container = containerRef.current;
    const span = textRef.current;
    if (!container || !span) return;

    const containerWidth = container.clientWidth;
    if (containerWidth <= 0) return;

    // Start from max size and compute a best-fit size based on current overflow
    span.style.fontSize = `${maxFontSizePx}px`;
    const fullWidth = span.scrollWidth;

    let nextSize = maxFontSizePx;
    if (fullWidth > containerWidth && fullWidth > 0) {
      const ratio = containerWidth / fullWidth;
      nextSize = Math.floor(maxFontSizePx * ratio);
      nextSize = Math.max(minFontSizePx, Math.min(maxFontSizePx, nextSize));
      span.style.fontSize = `${nextSize}px`;

      // Guard: if still overflowing after rounding, step down until it fits or we hit min
      let safety = 0;
      while (
        span.scrollWidth > containerWidth &&
        nextSize > minFontSizePx &&
        safety < 10
      ) {
        nextSize -= 1;
        span.style.fontSize = `${nextSize}px`;
        safety += 1;
      }
    }

    setFontSize(nextSize);
  };

  return (
    <div
      ref={containerRef}
      className={`athlete-name ${className}`}
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      <span
        ref={textRef}
        style={{
          fontSize: `${fontSize}px`,
          display: "inline-block",
          lineHeight: 1,
        }}
      >
        {children}
      </span>
    </div>
  );
};
