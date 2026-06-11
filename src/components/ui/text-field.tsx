"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import type { ReactNode } from "react"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface TextFieldProps {
    field: AnyFieldApi
    label: ReactNode
    /** Message shown when the field is touched and invalid. */
    errors?: ({ message?: string } | string | undefined)[]
    error?: ReactNode
    placeholder?: string
    /** Render a `Textarea` instead of an `Input`. */
    multiline?: boolean
    maxLength?: number
    className?: string
}

/**
 * Presentational wrapper around a TanStack `form.Field` render-prop child.
 * Replaces the ~25-line Field/Label/Input/FieldError boilerplate repeated
 * across every dialog form.
 */
export function TextField({
    field,
    label,
    errors,
    error,
    placeholder,
    multiline,
    maxLength,
    className
}: TextFieldProps) {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {multiline ? (
                <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={maxLength}
                    className={className}
                    placeholder={placeholder}
                    aria-invalid={isInvalid}
                />
            ) : (
                <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={maxLength}
                    className={className}
                    placeholder={placeholder}
                    aria-invalid={isInvalid}
                />
            )}
            {isInvalid && (
                <FieldError
                    errors={error ? [error.toString()] : errors}
                ></FieldError>
            )}
        </Field>
    )
}
