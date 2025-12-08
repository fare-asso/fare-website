"use client"

import React, { type InputHTMLAttributes } from "react"
import type { FieldError } from "react-hook-form"
import { RiErrorWarningFill } from "react-icons/ri"
import { cn } from "@/lib/utils"

const TextArea = React.forwardRef<
    HTMLTextAreaElement,
    InputHTMLAttributes<HTMLTextAreaElement> & {
        className?: string
        error?: FieldError
    }
>(({ className, error, ...props }, ref) => {
    return (
        <div className="relative flex w-full flex-row items-center justify-end">
            <textarea className={cn(className)} ref={ref} {...props} />

            {/* Error */}
            {error && ( // Afficher uniquement si une erreur est présente
                <div className="absolute right-0 bottom-0 flex flex-row items-end p-2">
                    <RiErrorWarningFill
                        className="text-red-500 transition-all group-hover:scale-105"
                        size={20}
                        title={error.message} // Optionnel : pour afficher un tooltip avec l'erreur
                    />
                </div>
            )}
        </div>
    )
})

TextArea.displayName = "TextArea"
export default TextArea
