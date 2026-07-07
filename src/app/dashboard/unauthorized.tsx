import { createFileRoute } from "@tanstack/react-router"

import { dashboardTitle } from "@/lib/seo"

export const Route = createFileRoute("/dashboard/unauthorized")({
    head: () => ({ meta: [{ title: dashboardTitle("Unauthorized") }] }),
    component: UnauthorizedPage
})

function UnauthorizedPage() {
    return (
        <div className="flex h-1/2 w-full flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-bold">⚠️ Accès refusé ⚠️</h1>
            <p className="mt-4 text-lg">
                Vous n'avez pas les permissions nécessaires pour accéder à cette
                page.
                <br />
                Veuillez contacter un administrateur si vous pensez que c'est
                une erreur.
            </p>
        </div>
    )
}
