import type { Metadata } from "next"
import "../globals.css"

import { Toaster } from "@/components/ui/toaster"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import SideBarApp from "@/components/dashboard/sideBarApp"
import { redirect } from "next/navigation"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import CurrentRoute from "@/components/dashboard/currentRoute"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
    title: "Dashboard",
    description: ""
}

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    // Check user permissions
    const user = await getCurrentUserWithPermissions()

    if (!user) {
        redirect("/login")
    }

    // Check if user has access to dashboard
    const permissions = user.permissions.map(
        (permission) => permission.permission
    )

    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen overflow-hidden">
                {/* Sidebar à gauche */}
                <SideBarApp permissions={permissions} />

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
                    <main className="mx-4 mt-12 mb-4 flex-1 overflow-y-auto rounded-lg border bg-white p-4 shadow-md">
                        {children}
                    </main>
                </div>
            </div>

            <Toaster />
        </SidebarProvider>
    )
}
