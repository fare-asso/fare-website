import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"

interface UnauthorizedPageProps {
    user: ShellUser
    pathname: string
}

export default function UnauthorizedPage({
    user,
    pathname
}: UnauthorizedPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <div className="flex h-1/2 w-full flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold">⚠️ Accès refusé ⚠️</h1>
                <p className="mt-4 text-lg">
                    Vous n'avez pas les permissions nécessaires pour accéder à
                    cette page.
                    <br />
                    Veuillez contacter un administrateur si vous pensez que
                    c'est une erreur.
                </p>
            </div>
        </DashboardShell>
    )
}
