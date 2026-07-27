"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateFieldProps {
    field: AnyFieldApi
    label: ReactNode
    /** Message shown when the field is touched and invalid. */
    error?: ReactNode
    /** Bounds + `captionLayout="dropdown"` for wide ranges (birth dates…). */
    startMonth?: Date
    endMonth?: Date
    captionLayout?: ComponentProps<typeof Calendar>["captionLayout"]
}

/**
 * Presentational date picker (Popover + Calendar) for a TanStack
 * `form.Field` render-prop child, in the same spirit as `TextField`.
 */
export function DateField({
    field,
    label,
    error,
    startMonth,
    endMonth,
    captionLayout
}: DateFieldProps) {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    const value = field.state.value as Date | undefined

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id={field.name}
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground",
                            isInvalid &&
                                "border-destructive focus-visible:ring-destructive"
                        )}
                        aria-invalid={isInvalid}
                        aria-describedby={
                            isInvalid ? `${field.name}-error` : undefined
                        }
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? (
                            format(value, "PPP", { locale: fr })
                        ) : (
                            <span>Sélectionnez une date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        captionLayout={captionLayout}
                        startMonth={startMonth}
                        endMonth={endMonth}
                        selected={value}
                        onSelect={(date) => {
                            if (date) field.handleChange(date)
                            field.handleBlur()
                        }}
                    />
                </PopoverContent>
            </Popover>
            {isInvalid && error && (
                <FieldError id={`${field.name}-error`}>{error}</FieldError>
            )}
        </Field>
    )
}
