import logoMark from "@/assets/logo.png";
import { cn } from "@/lib/utils";

/**
 * The university seal, cropped to the crest. It keeps a white tile behind it
 * rather than sitting straight on the navy chrome — half the seal is navy and
 * would disappear otherwise.
 *
 * Every use so far sits next to the words "Nyenneh University", so the image
 * is decorative and stays out of the accessibility tree.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logoMark}
      alt=""
      aria-hidden
      className={cn("size-9 shrink-0 rounded-xl bg-white object-contain", className)}
    />
  );
}
