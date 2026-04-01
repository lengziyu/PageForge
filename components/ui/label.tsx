import * as React from "react";
import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      className={cn("text-xs font-medium text-[var(--muted-foreground)] md:text-sm", className)}
      ref={ref}
      {...props}
    />
  ),
);

Label.displayName = "Label";

export { Label };

