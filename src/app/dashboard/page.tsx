import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import StorageChart from "@/app/dashboard/components/storageChart/storageChart"
import DbSizeChart from "@/app/dashboard/components/dbSizeChart/dbSizeChart"

export default async function Dashboard() {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.getUser()

    if (error || !data.user) {
        return (
            <div className="p-4">
                Erreur lors de la récupération de l'utilisateur
            </div>
        )
    }

    const user = await prisma.user.findFirst({
        where: { id: data.user.id },
        select: { name: true }
    })

    if (!user) {
        return (
            <div className="p-4">
                Erreur lors de la récupération de l'utilisateur
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <h2 className="text-3xl font-bold">Bienvenue {user.name}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                <StorageChart />
                <DbSizeChart />
            </div>
        </div>
    )
}
