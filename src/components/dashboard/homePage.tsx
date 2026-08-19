import { ArrowRightIcon, CalendarDaysIcon } from "lucide-react"

import { dateToString } from "@/helpers/date"

interface DashboardItem {
    href: string
    label: string
    value: number
}

interface UpcomingEvent {
    id: number
    name: string
    startTime: Date
    location: string
}

interface HomePageProps {
    userName: string | null
    items: DashboardItem[]
    pendingItems: DashboardItem[]
    upcomingEvents: UpcomingEvent[]
}

export default function HomePage({
    userName,
    items,
    pendingItems,
    upcomingEvents
}: HomePageProps) {
    return (
        <div className="mx-auto max-w-6xl space-y-8 p-2 @md:p-6">
            <header>
                <p className="text-muted-foreground text-sm font-medium">
                    Tableau de bord fédéral
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight">
                    Bonjour {userName ?? "!"}
                </h1>
            </header>

            {pendingItems.length > 0 && (
                <section aria-labelledby="to-process-heading">
                    <div className="mb-4">
                        <h2
                            id="to-process-heading"
                            className="text-xl font-semibold"
                        >
                            À traiter
                        </h2>
                    </div>
                    <div className="grid gap-3 @md:grid-cols-2 @xl:grid-cols-3">
                        {pendingItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="group bg-card hover:border-fare-accent/50 flex min-h-20 items-center gap-4 rounded-xl border px-5 py-4 shadow-sm transition-colors"
                            >
                                <span className="min-w-0 flex-1 leading-snug font-medium">
                                    {item.label}
                                </span>
                                <span className="bg-muted min-w-9 rounded-md px-2 py-1 text-center text-sm font-semibold tabular-nums">
                                    {item.value}
                                </span>
                                <ArrowRightIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {upcomingEvents.length > 0 && (
                <section aria-labelledby="events-heading">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="text-fare-accent size-5" />
                            <h2
                                id="events-heading"
                                className="text-xl font-semibold"
                            >
                                Prochains évènements
                            </h2>
                        </div>
                        <a
                            href="/dashboard/events"
                            className="text-fare-accent text-sm font-medium hover:underline"
                        >
                            Tout voir
                        </a>
                    </div>
                    <div className="bg-card divide-y rounded-xl border shadow-sm">
                        {upcomingEvents.map((event) => (
                            <a
                                key={event.id}
                                href="/dashboard/events"
                                className="hover:bg-muted/50 grid gap-1 p-4 transition-colors @md:grid-cols-[11rem_1fr_auto] @md:items-center"
                            >
                                <time className="text-muted-foreground text-sm">
                                    {dateToString(event.startTime)}
                                </time>
                                <span className="font-medium">
                                    {event.name}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    {event.location}
                                </span>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            <section aria-labelledby="areas-heading">
                <div className="mb-3">
                    <h2 id="areas-heading" className="text-xl font-semibold">
                        Vos espaces
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Contenus accessibles et publiés.
                    </p>
                </div>
                <div className="grid gap-3 @sm:grid-cols-2 @lg:grid-cols-3">
                    {items.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="group bg-card hover:border-fare-accent/50 flex min-h-20 items-center gap-4 rounded-xl border px-5 py-4 shadow-sm transition-colors"
                        >
                            <span className="text-muted-foreground min-w-0 flex-1 text-sm leading-snug font-medium">
                                {item.label}
                            </span>
                            <span className="text-xl font-semibold tabular-nums">
                                {item.value}
                            </span>
                            <ArrowRightIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                        </a>
                    ))}
                </div>
            </section>
        </div>
    )
}
