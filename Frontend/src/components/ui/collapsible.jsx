import * as React from "react";
import { cn } from "../../lib/utils";

function Collapsible({ className, children, ...props }) {
  return (
    <div
      data-slot="collapsible"
      className={cn("space-y-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CollapsibleTrigger({ className, children, ...props }) {
  return (
    <button
      data-slot="collapsible-trigger"
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 shrink-0 transition-transform duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}

function CollapsibleContent({ className, children, ...props }) {
  return (
    <div
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden text-sm transition-all",
        "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
      )}
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
