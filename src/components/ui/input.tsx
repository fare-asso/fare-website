import * as React from "react"

import { useField } from "@/components/ui/field"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        const field = useField()
        return (
            <input
                type={type}
                aria-describedby={field?.invalid ? field.errorId : undefined}
                aria-required={field && !field.optional ? true : undefined}
                className={cn(
                    "border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex h-10 w-full rounded-md border px-3 py-2 text-base outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
