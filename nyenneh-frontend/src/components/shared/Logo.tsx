import logoMark from "@/assets/logo.png";
import { cn } from "@/lib/utils";

// The seal, cropped to the crest. Needs the white tile behind it - half the
// seal is navy and vanishes against the navy chrome otherwise.
// It always sits next to the words "Nyenneh University", so it is decorative
// and stays out of the accessibility tree.
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
