import * as React from "react";
import { badgeVariants } from "../../lib/variants";

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      data-slot="badge"
      className={badgeVariants(variant, className)}
      {...props}
    />
  );
}

export { Badge };
