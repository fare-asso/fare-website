import { useEffect, useState } from "react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import { StorageChartClient } from "./storageChartClient"

export default function StorageChart() {
    const [usage, setUsage] = useState<{
        used: number
        total: number
    } | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        let cancelled = false
        fetch("/api/dashboard/storage")
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((json: { used: number; total: number }) => {
                if (!cancelled) setUsage(json)
            })
            .catch(() => {
                if (!cancelled) setError(true)
            })
        return () => {
            cancelled = true
        }
    }, [])

    if (error) {
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

    if (!usage) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Stockage</CardTitle>
                </CardHeader>
                <CardContent className="h-64">Chargement...</CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stockage</CardTitle>
                <CardDescription>
                    {usage.used.toFixed(2)} / {usage.total} Go{" "}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
                <StorageChartClient used={usage.used} total={usage.total} />
            </CardContent>
        </Card>
    )
}
