import { ArchiveIcon, FileTextIcon, InboxIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/helpers/db"

export default async function AdhesionSummary() {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [total, activeCount, archivedCount, recentCount] = await Promise.all([
        prisma.adhesion.count(),
        prisma.adhesion.count({
            where: { archived: null }
        }),
        prisma.adhesion.count({
            where: { archived: { not: null } }
        }),
        prisma.adhesion.count({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                archived: null
            }
        })
    ])

    const stats = [
        {
            label: "Total adhésions",
            value: total,
            icon: FileTextIcon,
            description: "Toutes les demandes"
        },
        {
            label: "En attente",
            value: activeCount,
            icon: InboxIcon,
            description: `dont ${recentCount} ce mois-ci`
        },
        {
            label: "Archivées",
            value: archivedCount,
            icon: ArchiveIcon,
            description: "Demandes traitées"
        }
    ]

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
                <Card key={stat.label}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">
                            {stat.label}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-2xl">{stat.value}</div>
                        <p className="text-muted-foreground text-xs">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
