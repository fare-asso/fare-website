import { useEffect, useState } from "react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import { DbSizeChartClient } from "./dbSizeChartClient"

export default function DbSizeChart() {
    const [usage, setUsage] = useState<{
        used: number
        total: number
    } | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        let cancelled = false
        fetch("/api/dashboard/db-size")
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
                    <CardTitle>Database</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                    Erreur lors de la récupération de la taille de la base de
                    données
                </CardContent>
            </Card>
        )
    }

    if (!usage) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Database</CardTitle>
                </CardHeader>
                <CardContent className="h-64">Chargement...</CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Database</CardTitle>
                <CardDescription>
                    {usage.used.toFixed(3)} / {usage.total} Go{" "}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
                <DbSizeChartClient size={usage.used} total={usage.total} />
            </CardContent>
        </Card>
    )
}
