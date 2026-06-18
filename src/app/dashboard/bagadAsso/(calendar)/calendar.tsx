"use client"

import { useHotkey } from "@tanstack/react-hotkeys"
import { isSameDay, isSameMonth, isToday } from "date-fns"
import {
    ChevronLeft,
    ChevronRight,
    ChevronRightIcon,
    MapPinIcon,
    UserIcon,
    UsersIcon
} from "lucide-react"
import Link from "next/link"
import { useQueryState, parseAsIsoDate } from "nuqs"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger
} from "@/components/ui/popover"
import type { BagadAssoTicket } from "@/generated/prisma/client"
import { locationDisplayName } from "@/helpers/location"
import { cn } from "@/lib/utils"

const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

const MAX_VISIBLE_EVENTS = 3

function monthGrid(month: Date): Date[] {
    const year = month.getFullYear()
    const m = month.getMonth()
    // Monday-first offset: getDay() gives 0=Sun..6=Sat
    const offset = (new Date(year, m, 1).getDay() + 6) % 7
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    const cells = Math.ceil((offset + daysInMonth) / 7) * 7
    return Array.from(
        { length: cells },
        (_, i) => new Date(year, m, 1 - offset + i)
    )
}

type Event = Pick<
    BagadAssoTicket,
    | "id"
    | "eventName"
    | "eventDate"
    | "assocation"
    | "eventAddr"
    | "firstName"
    | "lastName"
    | "phoneNumber"
    | "deleted"
>

export function Calendar({ events }: { events?: Event[] }) {
    const [month, setMonth] = useQueryState(
        "month",
        parseAsIsoDate.withDefault(new Date()).withOptions({})
    )

    const grid = useMemo(() => monthGrid(month), [month])

    function changeMonth(dir: "prev" | "next") {
        setMonth(
            (date) =>
                new Date(
                    date.getFullYear(),
                    date.getMonth() + (dir === "prev" ? -1 : 1),
                    1
                )
        )
    }

    useHotkey("ArrowLeft", () => {
        changeMonth("prev")
    })
    useHotkey("ArrowRight", () => {
        changeMonth("next")
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold capitalize">
                    {month.toLocaleString("fr-FR", {
                        month: "long",
                        year: "numeric"
                    })}
                </h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMonth(new Date())}
                    >
                        Aujourd'hui
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Mois précédent"
                        onClick={() => changeMonth("prev")}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Mois suivant"
                        onClick={() => changeMonth("next")}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="bg-border overflow-hidden rounded-xl border shadow-sm">
                <div className="bg-muted/40 grid grid-cols-7">
                    {days.map((day) => (
                        <div
                            key={day}
                            className="text-muted-foreground py-2.5 text-center text-xs font-medium tracking-wide uppercase"
                        >
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-px">
                    {grid.map((day) => {
                        const dayEvents =
                            events?.filter((e) =>
                                isSameDay(e.eventDate, day)
                            ) ?? []
                        const inMonth = isSameMonth(day, month)
                        const isCurrentDay = isToday(day)
                        return (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "bg-background flex min-h-36 flex-col gap-1 p-1.5 transition-colors transition-none",
                                    inMonth
                                        ? "hover:bg-muted/10"
                                        : "bg-muted/20 text-muted-foreground"
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex size-7 items-center justify-center self-end rounded-full text-sm",
                                        isCurrentDay &&
                                            "bg-fare-accent font-semibold text-white"
                                    )}
                                >
                                    {day.getDate()}
                                </span>
                                <div className="flex flex-col gap-1">
                                    {dayEvents
                                        .slice(0, MAX_VISIBLE_EVENTS)
                                        .map((event, i) => (
                                            <Event
                                                key={`${day.toISOString()}-${i}`}
                                                event={event}
                                            />
                                        ))}
                                    {dayEvents.length > MAX_VISIBLE_EVENTS && (
                                        <span className="text-muted-foreground px-1 text-xs">
                                            +
                                            {dayEvents.length -
                                                MAX_VISIBLE_EVENTS}{" "}
                                            autres
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function Event({ event }: { event: Event }) {
    const isArchived = event.deleted !== null
    const isPast = !isArchived && event.eventDate < new Date()
    return (
        <Popover>
            <PopoverTrigger>
                <div
                    title={event.eventName}
                    className={cn(
                        "truncate rounded-md px-1.5 py-0.5 text-start text-sm font-medium",
                        isArchived
                            ? "bg-muted/60 text-muted-foreground/70 line-through"
                            : isPast
                              ? "bg-muted text-muted-foreground"
                              : "bg-fare-accent/10 text-fare-accent"
                    )}
                >
                    {event.eventName} -{" "}
                    <span className="font-bold">{event.assocation}</span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="slide-in-bottom">
                <PopoverHeader className="space-y-2">
                    <PopoverTitle>{event.eventName}</PopoverTitle>
                    <PopoverDescription className="space-y-2">
                        <span className="text-foreground flex flex-col gap-1.5">
                            <span className="flex items-start gap-2 font-bold">
                                <UsersIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                {event.assocation}
                            </span>
                            <span className="flex items-start gap-2">
                                <MapPinIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                {locationDisplayName(event.eventAddr)}
                            </span>
                            <span className="flex items-start gap-2">
                                <UserIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                {event.firstName} {event.lastName}
                                {event.phoneNumber ? (
                                    <>
                                        {" "}
                                        ·
                                        <a
                                            href={`tel:${event.phoneNumber}`}
                                            className="underline"
                                        >
                                            {event.phoneNumber}
                                        </a>
                                    </>
                                ) : (
                                    ""
                                )}
                            </span>
                        </span>
                        <Button asChild variant="link" className="px-0">
                            <Link
                                href={`/dashboard/bagadAsso/tickets/${event.id}`}
                            >
                                Détails du ticket <ChevronRightIcon />
                            </Link>
                        </Button>
                    </PopoverDescription>
                </PopoverHeader>
            </PopoverContent>
        </Popover>
    )
}
