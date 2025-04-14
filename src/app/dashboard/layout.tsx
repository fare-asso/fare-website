import type { Metadata } from "next";
import "../globals.css";

import { Toaster } from "@/components/ui/toaster";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SideBarApp from "@/components/dashboard/sideBarApp";
import getCurrentUserId from "@/helpers/user/id";
import { redirect } from "next/navigation";
import prisma from "@/helpers/db";
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Check user permissions
    const user = await getCurrentUserWithPermissions();

    if (!user) {
        redirect("/login");
    }

    // Check if user has access to dashboard
    const permissions = user.permissions.map(
        (permission) => permission.permission,
    );

    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen overflow-hidden">
                {/* Sidebar à gauche */}
                <SideBarApp permissions={permissions} />

                {/* Contenu principal */}
                <div className="flex h-full w-full flex-col">
                    {/* Barre du haut */}
                    <header className="flex h-12 w-full flex-row items-center p-4">
                        <SidebarTrigger />
                    </header>

                    {/* Zone de contenu scrollable */}
                    <main className="flex-1 overflow-y-auto p-4">
                        {children}
                    </main>
                </div>
            </div>

            <Toaster />
        </SidebarProvider>
    );
}
