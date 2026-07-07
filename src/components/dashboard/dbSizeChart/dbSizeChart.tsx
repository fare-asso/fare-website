import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import { DbSizeChartClient } from "./dbSizeChartClient"

export default function DbSizeChart({ dbSize }: { dbSize: number }) {
    if (Number.isNaN(dbSize)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Database</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                    Erreur lors de la récupération de la taille de la base de
                    données
                </CardContent>
            </Card>
        )
    }

    const dbSizeInMb = dbSize / 1024 / 1024 / 1024 // Convert to Mb
    const maxDbSizeInGb = 0.5 // 0.5 Gb

    return (
        <Card>
            <CardHeader>
                <CardTitle>Database</CardTitle>
                <CardDescription>
                    {dbSizeInMb.toFixed(3)} / {maxDbSizeInGb} Go{" "}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
                <DbSizeChartClient size={dbSizeInMb} total={maxDbSizeInGb} />
            </CardContent>
        </Card>
    )
}
