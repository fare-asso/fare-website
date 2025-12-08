"use client"

import { cn } from "@/lib/utils"
import { InputHTMLAttributes } from "react"

import { RiErrorWarningFill } from "react-icons/ri"

import React from "react"
import { FieldError } from "react-hook-form"

const Input = React.forwardRef<
    HTMLInputElement,
    InputHTMLAttributes<HTMLInputElement> & {
        className?: string
        error?: FieldError
    }
>(({ className, error, ...props }, ref) => {
    return (
        <div className="relative flex w-full flex-row items-center justify-end">
            <input className={cn(className)} ref={ref} {...props} />

            {/* Error */}
            {error && ( // Afficher uniquement si une erreur est présente
                <div className="absolute mr-3 flex h-full flex-row items-center">
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

Input.displayName = "Input"

export default Input
