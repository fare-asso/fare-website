"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useState } from "react"

import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { Button } from "../button"
import { Calendar } from "../calendar"

export default function DatePicker({
    id,
    defaultValue,
    value,
    onChange,
    name,
    fromYear,
    toYear,
    ariaInvalid,
    className
}: {
    id?: string
    defaultValue?: Date
    value?: Date
    onChange?: (date: Date | undefined) => void
    name?: string
    fromYear?: number
    toYear?: number
    ariaInvalid?: boolean
    className?: string
}) {
    const [internalDate, setInternalDate] = useState<Date | undefined>(
        defaultValue ?? undefined
    )
    const date = onChange ? value : internalDate

    const handleSelect = (next: Date | undefined): void => {
        setInternalDate(next)
        onChange?.(next)
    }

    return (
        <div>
            <Popover>
                <PopoverTrigger asChild className="flex flex-col">
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        aria-invalid={ariaInvalid}
                        className={cn(
                            "flex w-52 flex-row",
                            ariaInvalid &&
                                "border-destructive focus-visible:ring-destructive",
                            className
                        )}
                    >
                        <svg
                            className="mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-label="Calendrier"
                        >
                            <title>Calendrier</title>
                            <path d="M8 2v4" />
                            <path d="M16 2v4" />
                            <rect width="18" height="18" x="3" y="4" rx="2" />
                            <path d="M3 10h18" />
                        </svg>
                        {date ? (
                            format(date, "PPP", { locale: fr })
                        ) : (
                            <span>Sélectionne une date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelect}
                        className="mb-3"
                        startMonth={
                            fromYear ? new Date(fromYear, 0) : undefined
                        }
                        endMonth={toYear ? new Date(toYear, 11) : undefined}
                    />
                </PopoverContent>
            </Popover>
            <input
                type="hidden"
                name={name}
                value={date ? date.toString() : ""}
            />
        </div>
    )
}
