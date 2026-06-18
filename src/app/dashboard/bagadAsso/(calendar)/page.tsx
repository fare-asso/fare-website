import { redirect } from "next/navigation"

import { Card, CardContent, CardDescription } from "@/components/ui/card"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { tryCatch } from "@/lib/utils"

import { Calendar } from "./calendar"

export default async function Tickets() {
    const user = await getCurrentUserWithPermissions()

    if (!hasPermission(user, "access:bagad-asso")) {
        return redirect("/dashboard/unauthorized")
    }

    const { value: tickets } = await tryCatch(prisma.bagadAssoTicket.findMany())

    const now = new Date()
    // most recent 1st September (start of the academic year)
    const academicYearStart = new Date(
        now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1,
        8,
        1
    )
    const active = (tickets ?? []).filter((t) => !t.deleted)
    const currentYear =
        tickets?.filter((t) => t.eventDate >= academicYearStart) ?? []
    const upcoming = active.filter((t) => t.eventDate >= now)
    const stats = [
        {
            label: "Événements depuis septembre",
            value: currentYear.length
        },
        { label: "Événements à venir", value: upcoming.length },
        {
            label: "Étudiants atteints depuis septembre",
            value: currentYear.reduce(
                (sum, t) => sum + t.estimatedParticipants,
                0
            )
        }
    ]

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardContent className="h-1/2 flex-1 p-0">
                <section className="mb-6 grid grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} variant="flat" className="gap-1">
                            <CardDescription>{stat.label}</CardDescription>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </Card>
                    ))}
                </section>
                <Calendar events={tickets ?? []} />
            </CardContent>
        </Card>
    )
}
