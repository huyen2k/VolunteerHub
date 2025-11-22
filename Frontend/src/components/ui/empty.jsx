import * as React from "react";
import { cn } from "../../lib/utils";

function Empty({ className, children, ...props }) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function EmptyIcon({ className, ...props }) {
  return (
    <div
      data-slot="empty-icon"
      className={cn(
        "mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center",
        className
      )}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }) {
  return (
    <h3
      data-slot="empty-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }) {
  return (
    <p
      data-slot="empty-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export { Empty, EmptyIcon, EmptyTitle, EmptyDescription };
