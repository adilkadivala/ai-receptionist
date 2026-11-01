import { cn } from "@receptionist/ui/lib/utils";

// Fades a layer out from the middle of its top edge.
const fadeFromTop = (stops: string) => `radial-gradient(ellipse 50% 100% at 50% 0%, ${stops})`;

/**
 * The Signal motif behind the header: a faint dithered field of primary pixels over a dot grid, both fading out
 * downwards. Place it inside a positioned element.
 */
export function PixelField({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0", className)}>
      <div
        className="absolute inset-x-[15%] top-0 h-[150px] opacity-55"
        style={{
          backgroundImage: "repeating-conic-gradient(var(--primary) 0 25%, transparent 0 50%)",
          backgroundSize: "6px 6px",
          maskImage: fadeFromTop("black 0%, rgb(0 0 0 / 35%) 45%, transparent 75%"),
        }}
      />
      <div
        className="absolute inset-x-[5%] top-0 h-[190px] opacity-50"
        style={{
          backgroundImage: "radial-gradient(circle, var(--primary) 1.2px, transparent 1.4px)",
          backgroundSize: "14px 14px",
          maskImage: fadeFromTop("black 0%, transparent 70%"),
        }}
      />
    </div>
  );
}
