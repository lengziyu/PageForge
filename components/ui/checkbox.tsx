"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        "h-4 w-4 cursor-pointer rounded-[4px] border border-[var(--border)] bg-[var(--card)] align-middle accent-[var(--primary)]",
        className,
      )}
      ref={ref}
      type="checkbox"
      {...props}
    />
  ),
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
