"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import { MinusIcon, PlusIcon } from "lucide-react"
import { type ReactNode, useState } from "react"

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

    // `draft` (when non-null) lets the user freely type partial input such as
    // "" or "0." without it being clamped/parsed away mid-keystroke.
    const [draft, setDraft] = useState<string | null>(null)
    const display = draft ?? (field.state.value ?? "").toString()

    // Commit a final, clamped value (steppers and on blur).
    const commit = (next: number): void => {
        setDraft(null)
        field.handleChange(clamp(Number.isNaN(next) ? min : next, min, max))
    }

    // Live typing: keep the raw text, push a parsed number through for
    // validation, but don't clamp until blur.
    const handleType = (raw: string): void => {
        setDraft(raw)
        if (raw === "") return
        const parsed = Number(raw)
        if (!Number.isNaN(parsed)) field.handleChange(parsed)
    }

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
                        onClick={() => commit(value - step)}
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
                    value={display}
                    placeholder={placeholder}
                    aria-invalid={isInvalid}
                    onBlur={() => {
                        commit(draft === null ? value : Number(draft))
                        field.handleBlur()
                    }}
                    onChange={(e) => handleType(e.target.value)}
                    className={cn(
                        "h-full min-w-0 flex-1 [appearance:textfield] bg-transparent text-sm outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                        hasSteppers ? "border-x text-center" : "px-3"
                    )}
                />
                {hasSteppers && (
                    <button
                        type="button"
                        aria-label="Augmenter"
                        onClick={() => commit(value + step)}
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
