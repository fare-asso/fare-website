"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useState } from "react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "../button"
import { Calendar } from "../calendar"

export default function DatePicker({
    defaultValue,
    name,
    fromYear,
    toYear
}: {
    defaultValue?: Date
    name?: string
    fromYear?: number
    toYear?: number
}) {
    const [date, setDate] = useState<Date | undefined>(
        defaultValue ?? undefined
    )

    return (
        <div>
            <Popover>
                <PopoverTrigger asChild className="flex flex-col">
                    <Button variant="outline" className="flex w-52 flex-row">
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
                        >
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
                        onSelect={setDate}
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
