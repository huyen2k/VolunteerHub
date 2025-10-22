import * as React from "react";
import { buttonVariants } from "../../lib/variants";

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? "button" : "button";

  return (
    <Comp
      data-slot="button"
      className={buttonVariants(variant, size, className)}
      {...props}
    />
  );
}

export { Button };
