import * as React from "react";
import { cn } from "../../lib/utils";

function Spinner({ className, ...props }) {
  return (
    <div
      data-slot="spinner"
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      {...props}
    />
  );
}

export { Spinner };
