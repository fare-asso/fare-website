"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import { MinusIcon, PlusIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { clamp } from "@/helpers/math"
import { cn } from "@/lib/utils"

interface NumberFieldProps {
    field: AnyFieldApi
    label: ReactNode
    min?: number
    max?: number
    step?: number
    /** Trailing adornment (e.g. "€"). Replaces the +/- steppers when set. */
    suffix?: ReactNode
    placeholder?: string
    errors?: ({ message?: string } | string | undefined)[]
    error?: ReactNode
    className?: string
}

/**
 * TanStack `form.Field` wrapper rendering a number input. Without `suffix` it
 * shows a −/+ stepper; with `suffix` it shows a plain input and the adornment
 * (e.g. a currency symbol).
 */
export function NumberField({
    field,
    label,
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    step = 1,
    suffix,
    placeholder,
    errors,
    error,
    className
}: NumberFieldProps) {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    const value = Number(field.state.value ?? 0)
    const hasSteppers = suffix === undefined

    const set = (next: number): void =>
        field.handleChange(clamp(Number.isNaN(next) ? min : next, min, max))

    return (
        <Field data-invalid={isInvalid} className={className}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <div
                className={cn(
                    "border-input focus-within:border-ring focus-within:ring-ring/50 flex h-10 items-stretch overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]",
                    isInvalid &&
                        "border-destructive focus-within:border-destructive focus-within:ring-destructive/20"
                )}
            >
                {hasSteppers && (
                    <button
                        type="button"
                        aria-label="Diminuer"
                        onClick={() => set(value - step)}
                        disabled={value <= min}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground flex aspect-square h-full items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-40"
                    >
                        <MinusIcon className="size-4" />
                    </button>
                )}
                <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    inputMode={step < 1 ? "decimal" : "numeric"}
                    min={min}
                    max={max}
                    step={step}
                    value={Number.isNaN(value) ? "" : value}
                    placeholder={placeholder}
                    aria-invalid={isInvalid}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                        set(
                            e.target.value === "" ? min : Number(e.target.value)
                        )
                    }
                    className={cn(
                        "h-full min-w-0 flex-1 [appearance:textfield] bg-transparent text-sm outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                        hasSteppers ? "border-x text-center" : "px-3"
                    )}
                />
                {hasSteppers && (
                    <button
                        type="button"
                        aria-label="Augmenter"
                        onClick={() => set(value + step)}
                        disabled={value >= max}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground flex aspect-square h-full items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-40"
                    >
                        <PlusIcon className="size-4" />
                    </button>
                )}
                {suffix !== undefined && (
                    <span className="text-muted-foreground bg-muted/50 flex items-center border-l px-3 text-sm select-none">
                        {suffix}
                    </span>
                )}
            </div>
            {isInvalid && (
                <FieldError errors={error ? [error.toString()] : errors} />
            )}
        </Field>
    )
}
