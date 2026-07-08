import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"

import DbSizeChart from "./charts/dbSizeChart/dbSizeChart"
import StorageChart from "./charts/storageChart/storageChart"

interface HomePageProps {
    user: ShellUser
    pathname: string
    userName: string | null
}

export default function HomePage({ user, pathname, userName }: HomePageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <div className="space-y-6 p-6">
                <h2 className="text-3xl font-bold">Bienvenue {userName}</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                    <StorageChart />
                    <DbSizeChart />
                </div>
            </div>
        </DashboardShell>
    )
}
