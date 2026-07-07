import { Await, createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import DbSizeChart from "@/components/dashboard/dbSizeChart/dbSizeChart"
import StorageChart from "@/components/dashboard/storageChart/storageChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/helpers/db.server"
import { createClient } from "@/helpers/supabase.server"
import { tryCatch } from "@/lib/utils"

const getUserName = createServerFn().handler(async () => {
    const supabase = createClient()
    const { error, data } = await supabase.auth.getUser()
    if (error || !data.user) return null

    const user = await tryCatch(
        prisma.user.findFirst({
            where: { id: data.user.id },
            select: { name: true }
        })
    )
    if (!user.success || !user.value) return null
    return user.value.name
})

const getStorageSize = createServerFn().handler(async () => {
    const supabase = createClient()
    const storageSize: number = (
        await supabase.rpc("total_storage_used_all_buckets")
    ).data
    return storageSize
})

const getDbSize = createServerFn().handler(async () => {
    const supabase = createClient()
    const dbSize: number = (await supabase.rpc("total_database_size")).data
    return dbSize
})

export const Route = createFileRoute("/dashboard/")({
    loader: async () => ({
        userName: await getUserName(),
        storageSize: getStorageSize(),
        dbSize: getDbSize()
    }),
    component: Dashboard
})

function ChartFallback({ title }: { title: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="h-64">Chargement...</CardContent>
        </Card>
    )
}

function Dashboard() {
    const { userName, storageSize, dbSize } = Route.useLoaderData()

    if (!userName) {
        return (
            <div className="p-4">
                Erreur lors de la récupération de l'utilisateur
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <h2 className="text-3xl font-bold">Bienvenue {userName}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Await
                    promise={storageSize}
                    fallback={<ChartFallback title="Stockage" />}
                >
                    {(size) => <StorageChart storageSize={size} />}
                </Await>
                <Await
                    promise={dbSize}
                    fallback={<ChartFallback title="Database" />}
                >
                    {(size) => <DbSizeChart dbSize={size} />}
                </Await>
            </div>
        </div>
    )
}
