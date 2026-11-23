"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import type { ComponentProps, ReactNode } from "react"

import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface TextFieldProps {
    field: AnyFieldApi
    label: ReactNode
    description?: ReactNode
    /** Message shown when the field is touched and invalid. */
    errors?: ({ message?: string } | string | undefined)[]
    error?: ReactNode
    placeholder?: string
    type?: ComponentProps<typeof Input>["type"]
    inputMode?: ComponentProps<typeof Input>["inputMode"]
    /** Render a `Textarea` instead of an `Input`. */
    multiline?: boolean
    maxLength?: number
    className?: string
    /** Suppress the default aria-required on the control. */
    optional?: boolean
}

/**
 * Presentational wrapper around a TanStack `form.Field` render-prop child.
 * Replaces the ~25-line Field/Label/Input/FieldError boilerplate repeated
 * across every dialog form.
 */
export function TextField({
    field,
    label,
    description,
    errors,
    error,
    placeholder,
    type,
    inputMode,
    multiline,
    maxLength,
    className,
    optional
}: TextFieldProps) {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <Field data-invalid={isInvalid} optional={optional}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {multiline && description && (
                <FieldDescription>{description}</FieldDescription>
            )}
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
                    type={type}
                    inputMode={inputMode}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    maxLength={maxLength}
                    className={className}
                    placeholder={placeholder}
                    aria-invalid={isInvalid}
                />
            )}
            {!multiline && description && (
                <FieldDescription>{description}</FieldDescription>
            )}
            {isInvalid && (
                <FieldError
                    errors={error ? [error.toString()] : errors}
                ></FieldError>
            )}
        </Field>
    )
}
