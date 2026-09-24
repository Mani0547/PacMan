"use client";
import { ButtonHTMLAttributes, RefObject, useEffect } from "react";

/** Small shared arcade UI pieces. */

export function PacIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="-1 -1 2 2" className={className} aria-hidden="true">
      <path d="M0 0 L0.86 -0.5 A1 1 0 1 0 0.86 0.5 Z" fill="#ffe600" />
    </svg>
  );
}

export function PacChomp({ size = 28, flip = false }: { size?: number; flip?: boolean }) {
  return <div className={`pac-chomp ${flip ? "flip" : ""}`} style={{ width: size, height: size }} aria-hidden="true" />;
}

export function GhostIcon({ color, size = 28, scared = false, className = "" }: { color: string; size?: number; scared?: boolean; className?: string }) {
  const fill = scared ? "#2137ff" : color;
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className={className} aria-hidden="true" shapeRendering="crispEdges" style={{ filter: `drop-shadow(0 0 5px ${fill}88)` }}>
      <path d="M1 14V6a6 6 0 0 1 12 0v8l-2-2-2 2-2-2-2 2-2-2z" fill={fill} />
      {scared ? (
        <>
          <rect x="4" y="5" width="2" height="2" fill="#ffd6bd" /><rect x="8" y="5" width="2" height="2" fill="#ffd6bd" />
          <path d="M3 10l1-1 1 1 1-1 1 1 1-1 1 1 1-1" stroke="#ffd6bd" strokeWidth=".8" fill="none" />
        </>
      ) : (
        <>
          <rect x="3" y="4" width="3" height="4" fill="#fff" /><rect x="8" y="4" width="3" height="4" fill="#fff" />
          <rect x="5" y="5" width="2" height="2" fill="#1a2cff" /><rect x="10" y="5" width="2" height="2" fill="#1a2cff" transform="translate(-1 0)" />
        </>
      )}
    </svg>
  );
}

export function PacLoader({ label = "LOADING ARCADE..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-6" role="status" aria-live="polite">
      <div className="flex items-center">
        <PacChomp size={34} />
        <div className="dots-flow ml-2 h-9 w-[220px]" />
      </div>
      <p className="font-arcade text-[11px] neon-yellow">{label}</p>
    </div>
  );
}

export function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`font-arcade leading-[1.7] select-none ${className}`}>
      <div className="text-[10px] neon-blue">COUNTERPOINT</div>
      <div className="text-[8px] text-[#5a6bb8]">PAC-MAN ARCADE</div>
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "danger"; compact?: boolean };
export function ArcadeButton({ variant = "default", compact = false, className = "", children, ...rest }: BtnProps) {
  return (
    <button type="button" data-menu-item className={`arcade-btn ${variant} ${compact ? "compact" : ""} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** Arrow-key navigation between [data-menu-item] elements inside `ref`. */
export function useMenuNav(ref: RefObject<HTMLElement | null>, axis: "vertical" | "horizontal" | "both" = "vertical", autoFocus = true) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = () => Array.from(root.querySelectorAll<HTMLElement>("[data-menu-item]:not([disabled])"));
    if (autoFocus) items()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement) return;
      const prev = (axis !== "horizontal" && e.key === "ArrowUp") || (axis !== "vertical" && e.key === "ArrowLeft");
      const next = (axis !== "horizontal" && e.key === "ArrowDown") || (axis !== "vertical" && e.key === "ArrowRight");
      if (!prev && !next) return;
      const list = items();
      if (!list.length) return;
      e.preventDefault();
      const idx = list.indexOf(document.activeElement as HTMLElement);
      list[idx === -1 ? 0 : (idx + (next ? 1 : -1) + list.length) % list.length].focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ref, axis, autoFocus]);
}

export const fmt = (n: number): string => n.toLocaleString("en-US");
export const DIFF_COLOR: Record<string, string> = { EASY: "neon-green", "OK OK": "neon-yellow", NIGHTMARE: "neon-red" };
