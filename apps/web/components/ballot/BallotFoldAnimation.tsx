import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

/**
 * Chilean ballot fold ritual — 4-quadrant CSS 3D animation.
 *
 * Timeline (~2.45s total):
 *   0ms          → Phase 1: bottom half folds UP over top half (rotateX 180°, 700ms)
 *   700+200ms    → Phase 2: right half folds LEFT over left half (rotateY 180°, 700ms)
 *   1600+150ms   → Phase 3: folded packet drops into urna (500ms)
 *   2250+200ms   → Phase 4: scene fades out, parent shows success screen
 */

type Phase = "flat" | "fold1" | "fold2" | "drop" | "fadeout";

const BALLOT_W = 280;
const BALLOT_H = 360;

export function BallotFoldAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("flat");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fold1"), 80);
    const t2 = setTimeout(() => setPhase("fold2"), 80 + 700 + 200);
    const t3 = setTimeout(() => setPhase("drop"), 80 + 700 + 200 + 700 + 150);
    const t4 = setTimeout(() => setPhase("fadeout"), 80 + 700 + 200 + 700 + 150 + 500 + 300);
    const tEnd = setTimeout(onComplete, 80 + 700 + 200 + 700 + 150 + 500 + 300 + 400);
    return () => {
      [t1, t2, t3, t4, tEnd].forEach(clearTimeout);
    };
  }, [onComplete]);

  // Phase booleans for transform application
  const folded1 = phase === "fold1" || phase === "fold2" || phase === "drop" || phase === "fadeout";
  const folded2 = phase === "fold2" || phase === "drop" || phase === "fadeout";
  const dropped = phase === "drop" || phase === "fadeout";
  const fading = phase === "fadeout";

  const halfW = BALLOT_W / 2;
  const halfH = BALLOT_H / 2;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm overflow-hidden transition-opacity duration-500"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <p className="absolute top-16 text-xs uppercase tracking-[0.3em] text-muted-foreground animate-fade-in">
        Emitiendo voto…
      </p>

      {/* 3D stage */}
      <div
        className="relative"
        style={{ perspective: "1200px", perspectiveOrigin: "center center" }}
      >
        {/*
          Outer wrapper handles fold #2 (rotateY of right half is achieved by
          rotating an inner wrapper that contains both right quadrants together).
          Inner wrapper handles fold #1 (bottom half rotates up over top).
          We need 4 absolutely-positioned quadrants inside a preserve-3d tree.
        */}
        <div
          className="relative transition-transform"
          style={{
            width: BALLOT_W,
            height: BALLOT_H,
            transformStyle: "preserve-3d",
            transform: dropped
              ? `translateY(220px) scale(0.32)`
              : folded2
              ? `translate(-${halfW / 2}px, -${halfH / 2}px) scale(1)`
              : folded1
              ? `translate(0px, -${halfH / 2}px) scale(1)`
              : "none",
            transitionDuration: dropped ? "500ms" : "650ms",
            transitionTimingFunction: dropped ? "cubic-bezier(0.55,0.05,0.7,0.2)" : "ease-in-out",
          }}
        >
          {/* LEFT COLUMN (top-left + bottom-left) */}
          <Quadrant
            x={0}
            y={0}
            w={halfW}
            h={halfH}
            label="TL"
            originX="center"
            originY="bottom"
            rotateX={0}
          />
          {/* bottom-left folds UP over top-left */}
          <Quadrant
            x={0}
            y={halfH}
            w={halfW}
            h={halfH}
            label="BL"
            originX="center"
            originY="top"
            rotateX={folded1 ? -180 : 0}
            duration={700}
            zWhenFolded={2}
          />

          {/* RIGHT COLUMN — wrapped so we can fold it as a group leftward */}
          <div
            className="absolute"
            style={{
              left: halfW,
              top: 0,
              width: halfW,
              height: BALLOT_H,
              transformStyle: "preserve-3d",
              transformOrigin: "left center",
              transform: folded2 ? "rotateY(-180deg)" : "rotateY(0deg)",
              transition: "transform 700ms ease-in-out",
            }}
          >
            <Quadrant
              x={0}
              y={0}
              w={halfW}
              h={halfH}
              label="TR"
              originX="center"
              originY="bottom"
              rotateX={0}
            />
            <Quadrant
              x={0}
              y={halfH}
              w={halfW}
              h={halfH}
              label="BR"
              originX="center"
              originY="top"
              rotateX={folded1 ? -180 : 0}
              duration={700}
              zWhenFolded={2}
            />
          </div>

          {/* Horizontal crease shadow — visible only briefly during fold #1 */}
          <div
            className="pointer-events-none absolute left-0 right-0"
            style={{
              top: halfH - 1,
              height: 2,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0))",
              opacity: phase === "fold1" ? 1 : 0,
              transition: "opacity 300ms ease-out",
            }}
          />
        </div>
      </div>

      {/* SERVEL Urna */}
      <div
        className="absolute bottom-20 flex flex-col items-center"
        style={{
          animation: dropped ? "urnaShake 400ms ease-in-out 350ms" : "none",
          transformOrigin: "center bottom",
        }}
      >
        <svg viewBox="0 0 200 140" className="w-52 h-36" aria-hidden>
          <rect x="10" y="30" width="180" height="100" rx="4" fill="#003F8A" />
          <rect x="10" y="120" width="180" height="10" rx="2" fill="#002D63" />
          <rect x="60" y="38" width="80" height="6" rx="3" fill="#001E45" />
          <text
            x="100"
            y="90"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="22"
            fontWeight="900"
            fontFamily="Inter, sans-serif"
            letterSpacing="3"
          >
            SERVEL
          </text>
          <text
            x="100"
            y="108"
            textAnchor="middle"
            fill="#FFFFFF"
            fillOpacity="0.7"
            fontSize="8"
            fontFamily="Inter, sans-serif"
            letterSpacing="2"
          >
            URNA OFICIAL
          </text>
          <rect x="14" y="34" width="14" height="3" fill="#FFFFFF" />
          <rect x="14" y="37" width="14" height="3" fill="#C8151B" />
        </svg>
        <div className="mt-1 h-1.5 w-56 rounded-full bg-foreground/10 blur-sm" />
      </div>
    </div>
  );
}

/**
 * A single ballot quadrant. Rendered as a 3D card with a front and back face.
 * Front = paper white. Back = slightly darker (#E8E8E8) to simulate paper thickness.
 */
function Quadrant({
  x,
  y,
  w,
  h,
  label,
  originX,
  originY,
  rotateX,
  duration = 0,
  zWhenFolded = 1,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  originX: "left" | "center" | "right";
  originY: "top" | "center" | "bottom";
  rotateX: number;
  duration?: number;
  zWhenFolded?: number;
}) {
  const folded = rotateX !== 0;
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        transformStyle: "preserve-3d",
        transformOrigin: `${originX} ${originY}`,
        transform: `rotateX(${rotateX}deg)`,
        transition: duration ? `transform ${duration}ms ease-in-out` : undefined,
        zIndex: folded ? zWhenFolded : 1,
      }}
      aria-label={label}
    >
      {/* Front face */}
      <div
        className="absolute inset-0"
        style={{
          background: "#FFFFFF",
          border: "1px solid #CCCCCC",
          backfaceVisibility: "hidden",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.02)",
        }}
      />
      {/* Back face (the paper's reverse — slightly darker) */}
      <div
        className="absolute inset-0"
        style={{
          background: "#E8E8E8",
          border: "1px solid #BFBFBF",
          backfaceVisibility: "hidden",
          transform: "rotateX(180deg)",
        }}
      />
    </div>
  );
}
