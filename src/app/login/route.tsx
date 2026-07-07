import { createFileRoute, Outlet } from "@tanstack/react-router"

import { pageTitle } from "@/lib/seo"

export const Route = createFileRoute("/login")({
    head: () => ({
        meta: [
            { title: pageTitle("Connexion") },
            {
                name: "description",
                content: "Page de connexion pour les administrateur·ice·s"
            }
        ]
    }),
    component: LoginLayout
})

function LoginLayout() {
    return (
        <main className="grid min-h-screen place-items-center items-center p-2">
            <Outlet />
        </main>
    )
}
