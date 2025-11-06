import * as React from "react";
import { cn } from "../../lib/utils";

function Tooltip({ className, children, content, ...props }) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      data-slot="tooltip"
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
            "bottom-full left-1/2 mb-2 -translate-x-1/2",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
