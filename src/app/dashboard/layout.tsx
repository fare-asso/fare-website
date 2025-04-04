import type { Metadata } from "next";
import "../globals.css";

import { Toaster } from "@/components/ui/toaster";

import CurrentUser from "@/components/dashboard/currentUser";
import SignOutButton from "@/components/dashboard/signOutButton";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SideBarApp from "@/components/dashboard/sideBarApp";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen overflow-hidden">
                {/* Sidebar à gauche */}
                <SideBarApp />

                {/* Contenu principal */}
                <div className="flex h-full w-full flex-col">
                    {/* Barre du haut */}
                    <header className="flex h-12 w-full flex-row items-center p-4">
                        <SidebarTrigger />
                        {/* <div className="ml-auto flex items-center gap-2">
                            <CurrentUser />
                            <SignOutButton />
                        </div> */}
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
