import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { dashboardGuard } from "@/actions/auth/authGuard"
import CurrentRoute from "@/components/dashboard/currentRoute"
import SideBarApp from "@/components/dashboard/sideBarApp"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { dashboardTitle } from "@/lib/seo"

import dashboardCss from "@/styles/dashboard.css?url"

const getDashboardUser = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    if (!user) throw redirect({ href: "/login" })
    return {
        email: user.email,
        name: user.name,
        image: user.image,
        permissions: user.permissions.map((p) => p.permission)
    }
})

export const Route = createFileRoute("/dashboard")({
    beforeLoad: async ({ location }) => {
        await dashboardGuard({ data: { pathname: location.pathname } })
    },
    // The guard re-runs on router.invalidate() (every mutation) and full
    // loads; per-page serverFns keep their own permission checks.
    shouldReload: false,
    loader: () => getDashboardUser(),
    head: () => ({
        meta: [{ title: dashboardTitle() }],
        links: [{ rel: "stylesheet", href: dashboardCss }]
    }),
    component: DashboardLayout
})

function DashboardLayout() {
    const user = Route.useLoaderData()

    return (
        <SidebarProvider>
            <div className="flex h-svh w-screen overflow-hidden">
                {/* Sidebar à gauche */}
                <SideBarApp
                    permissions={user.permissions}
                    email={user.email}
                    name={user.name}
                    image={user.image}
                />

                {/* Contenu principal */}
                <div className="bg-sidebar flex h-full w-full flex-col">
                    {/* Barre du haut */}
                    <header className="fixed top-0 z-10 flex h-12 w-full flex-row items-center p-4">
                        <SidebarTrigger />
                        <Separator
                            orientation="vertical"
                            className="mx-2 h-8"
                        />
                        <CurrentRoute />
                    </header>

                    {/* Zone de contenu scrollable */}
                    <main className="@container mx-4 mt-12 mb-4 flex-1 overflow-y-auto rounded-lg border bg-white p-4 shadow-md">
                        <Outlet />
                    </main>
                </div>
            </div>

            <Toaster />
        </SidebarProvider>
    )
}
