import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => {
  const v = variant === "outline" ? "border border-orange-500/30 text-orange-400 bg-orange-950/30" :
              variant === "secondary" ? "bg-zinc-800 text-zinc-300" :
              variant === "destructive" ? "bg-red-950 text-red-400 border-red-800" :
              "bg-orange-500 text-black font-medium";
  return <span ref={ref} className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors", v, className)} {...props} />;
});
Badge.displayName = "Badge";
