import { QueryClientProvider } from "@tanstack/react-query"

import type { Permission } from "@/generated/prisma/client"
import type { UserWithPermissions } from "@/helpers/supabase/auth"
import { queryClient } from "@/lib/queryClient"

import { Separator } from "../ui/separator"
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar"
import { Toaster } from "../ui/sonner"
import CurrentRoute from "./currentRoute"
import SideBarApp from "./sideBarApp"

export interface ShellUser {
    email: string
    name?: string | null
    image?: string | null
    permissions: Permission[]
}

export function toShellUser(user: UserWithPermissions): ShellUser {
    return {
        email: user.email,
        name: user.name,
        image: user.image,
        permissions: user.permissions.map((up) => up.permission)
    }
}

export default function DashboardShell({
    user,
    pathname,
    children
}: {
    user: ShellUser
    pathname: string
    children: React.ReactNode
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <div className="flex h-svh w-screen overflow-hidden">
                    <SideBarApp
                        permissions={user.permissions}
                        email={user.email}
                        name={user.name}
                        image={user.image}
                        pathname={pathname}
                    />

                    <div className="bg-sidebar flex h-full w-full flex-col">
                        <header className="fixed top-0 z-10 flex h-12 w-full flex-row items-center p-4">
                            <SidebarTrigger />
                            <Separator
                                orientation="vertical"
                                className="mx-2 h-8"
                            />
                            <CurrentRoute path={pathname} />
                        </header>

                        <main className="@container mx-4 mt-12 mb-4 flex-1 overflow-y-auto rounded-lg border bg-white p-4 shadow-md">
                            {children}
                        </main>
                    </div>
                </div>

                <Toaster />
            </SidebarProvider>
        </QueryClientProvider>
    )
}
