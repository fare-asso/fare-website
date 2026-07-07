import { ArchiveIcon, FileTextIcon, InboxIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface AdhesionSummaryCounts {
    total: number
    activeCount: number
    archivedCount: number
    recentCount: number
}

export default function AdhesionSummary({
    total,
    activeCount,
    archivedCount,
    recentCount
}: AdhesionSummaryCounts) {
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
                        <CardTitle className="text-sm font-medium">
                            {stat.label}
                        </CardTitle>
                        <stat.icon className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-muted-foreground text-xs">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
