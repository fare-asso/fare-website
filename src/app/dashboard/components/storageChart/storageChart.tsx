import { createClient } from "@/helpers/supabase/server"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { StorageChartClient } from "./storageChartClient"

export default async function StorageChart() {
    const supabase = await createClient()

    const storageSize: number = (
        await supabase.rpc("total_storage_used_all_buckets")
    ).data

    if (isNaN(storageSize)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Stockage</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                    Erreur lors de la récupération de l'espace de stockage
                </CardContent>
            </Card>
        )
    }

    const storageUsedInGb = storageSize / 1024 / 1024 / 1024 // Convert to Gb
    const maxStorageSizeInGb = 1 // 1 Go in Mb

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stockage</CardTitle>
                <CardDescription>
                    {storageUsedInGb.toFixed(2)} / {maxStorageSizeInGb} Go{" "}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
                <StorageChartClient
                    used={storageUsedInGb}
                    total={maxStorageSizeInGb}
                />
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
