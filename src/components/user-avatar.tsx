import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cx, initials } from "@/lib/helpers";

const AVC = [
  "bg-blue-100 text-blue-900",
  "bg-green-100 text-green-900",
  "bg-amber-100 text-amber-900",
  "bg-violet-100 text-violet-900",
  "bg-rose-100 text-rose-900",
  "bg-cyan-100 text-cyan-900",
];
const AVS = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-20 w-20 text-2xl",
};

interface AvProps {
  name: string;
  size: "sm" | "md" | "lg";
  src?: string | null;
}

export function Av({ name, size = "md", src }: AvProps) {
  const c =
    AVC[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVC.length];
  return (
    <Avatar className={cx("shrink-0", AVS[size])}>
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback aria-hidden="true" className={cx("font-bold", c)}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
