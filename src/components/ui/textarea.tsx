import * as React from "react"

import { useField } from "@/components/ui/field"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
    const field = useField()
    return (
        <textarea
            aria-describedby={field?.invalid ? field.errorId : undefined}
            aria-required={field && !field.optional ? true : undefined}
            className={cn(
                "border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Textarea.displayName = "Textarea"

export { Textarea }
