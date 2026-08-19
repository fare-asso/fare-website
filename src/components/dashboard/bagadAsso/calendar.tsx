import { useHotkey } from "@tanstack/react-hotkeys"
import {
    endOfDay,
    isSameDay,
    isSameMonth,
    isToday,
    isWithinInterval,
    startOfDay
} from "date-fns"
import {
    ChevronLeft,
    ChevronRight,
    ChevronRightIcon,
    MapPinIcon,
    UserIcon,
    UsersIcon
} from "lucide-react"
import { useMemo, useState } from "react"

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
import { isEventPast } from "@/helpers/eventDate"
import { locationDisplayName } from "@/helpers/location"
import { useSearchParam } from "@/hooks/useSearchParam"
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

function toParam(date: Date): string {
    return date.toISOString().slice(0, 10)
}

type Event = Pick<
    BagadAssoTicket,
    | "id"
    | "eventName"
    | "eventDate"
    | "eventEndDate"
    | "association"
    | "eventAddr"
    | "firstName"
    | "lastName"
    | "phoneNumber"
    | "deleted"
>

export default function Calendar({ events }: { events?: Event[] }) {
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 15)
    const [defaultParam] = useState(() => toParam(thisMonth))
    const [monthParam, setMonthParam] = useSearchParam("month", defaultParam)
    const month = useMemo(() => new Date(monthParam), [monthParam])

    const grid = useMemo(() => monthGrid(month), [month])

    function changeMonth(dir: "prev" | "next") {
        setMonthParam(
            toParam(
                new Date(
                    month.getFullYear(),
                    month.getMonth() + (dir === "prev" ? -1 : 1),
                    15
                )
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
                        onClick={() => setMonthParam(toParam(thisMonth))}
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
                                isWithinInterval(day, {
                                    start: startOfDay(new Date(e.eventDate)),
                                    end: endOfDay(
                                        new Date(e.eventEndDate ?? e.eventDate)
                                    )
                                })
                            ) ?? []
                        const inMonth = isSameMonth(day, month)
                        const isCurrentDay = isToday(day)
                        return (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "bg-background flex min-h-36 flex-col gap-1 p-1.5 transition-none",
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
                                                day={day}
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

function Event({ day, event }: { day: Date; event: Event }) {
    const isArchived = event.deleted !== null
    const isPast =
        !isArchived && isEventPast(event.eventDate, event.eventEndDate)
    const isStart = isSameDay(day, new Date(event.eventDate))
    const isEnd = isSameDay(
        day,
        new Date(event.eventEndDate ?? event.eventDate)
    )
    const startsWeek = day.getDay() === 1
    const endsWeek = day.getDay() === 0
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    aria-label={event.eventName}
                    title={event.eventName}
                    className={cn(
                        "-mx-1.5 w-[calc(100%+0.75rem)] px-3 py-0.5 text-start text-sm font-medium",
                        isStart && !isEnd
                            ? "relative z-10 overflow-visible whitespace-nowrap"
                            : "truncate",
                        isStart || startsWeek
                            ? "rounded-l-md"
                            : "rounded-l-none",
                        isEnd || endsWeek ? "rounded-r-md" : "rounded-r-none",
                        isArchived
                            ? "bg-muted/60 text-muted-foreground/70 line-through"
                            : isPast
                              ? "bg-muted text-muted-foreground"
                              : "bg-fare-accent/10 text-fare-accent"
                    )}
                >
                    {isStart && (
                        <>
                            {event.eventName} -{" "}
                            <span className="font-bold">
                                {event.association}
                            </span>
                        </>
                    )}
                    {!isStart && <span className="invisible">.</span>}
                </button>
            </PopoverTrigger>
            <PopoverContent className="slide-in-bottom">
                <PopoverHeader className="space-y-2">
                    <PopoverTitle>{event.eventName}</PopoverTitle>
                    <PopoverDescription className="space-y-2">
                        <span className="text-foreground flex flex-col gap-1.5">
                            <span className="flex items-start gap-2 font-bold">
                                <UsersIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                {event.association}
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
                            <a
                                href={`/dashboard/bagadAsso/tickets/${event.id}`}
                            >
                                Détails du ticket <ChevronRightIcon />
                            </a>
                        </Button>
                    </PopoverDescription>
                </PopoverHeader>
            </PopoverContent>
        </Popover>
    )
}
