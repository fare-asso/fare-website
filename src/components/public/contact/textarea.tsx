"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

import { RiErrorWarningFill } from "react-icons/ri";

import React from "react";
import { FieldError } from "react-hook-form";

const TextArea = React.forwardRef<
    HTMLTextAreaElement,
    InputHTMLAttributes<HTMLTextAreaElement> & {
        className?: string;
        error?: FieldError;
    }
>(({ className, error, ...props }, ref) => {
    return (
        <div className="relative flex w-full flex-row items-center justify-end">
            <textarea className={cn(className)} ref={ref} {...props} />

            {/* Error */}
            {error && ( // Afficher uniquement si une erreur est présente
                <div className="absolute bottom-0 right-0 flex flex-row items-end p-2">
                    <RiErrorWarningFill
                        className="text-red-500 transition-all group-hover:scale-105"
                        size={20}
                        title={error.message} // Optionnel : pour afficher un tooltip avec l'erreur
                    />
                </div>
            )}
        </div>
    );
});

TextArea.displayName = "TextArea";
export default TextArea;
