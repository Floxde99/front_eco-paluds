import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // larger rounded inputs with subtle border and padding
        "placeholder:text-muted-foreground border border-gray-200 bg-white text-base w-full rounded-md px-3 py-2 shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary/60",
        className
      )}
      {...props} />
  );
}

export { Input }
