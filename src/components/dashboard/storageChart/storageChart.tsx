import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import { StorageChartClient } from "./storageChartClient"

export default function StorageChart({ storageSize }: { storageSize: number }) {
    if (Number.isNaN(storageSize)) {
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
        </Card>
    )
}
