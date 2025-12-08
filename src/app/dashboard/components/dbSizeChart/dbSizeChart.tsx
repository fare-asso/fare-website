import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { createClient } from "@/helpers/supabase/server"
import { DbSizeChartClient } from "./dbSizeChartClient"

export default async function DbSizeChart() {
    const supabase = await createClient()

    const dbSize: number = (await supabase.rpc("total_database_size")).data

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
            {/* <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by 5.2% this month{" "}
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter> */}
        </Card>
    )
}
