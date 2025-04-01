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
            <SideBarApp />

            <div className="flex h-screen w-full flex-col">
                <header className="flex h-12 w-full flex-row items-center p-4">
                    <SidebarTrigger />
                </header>
                <main
                    // className="flex h-[90%] w-full flex-col items-center lg:h-screen lg:max-h-screen lg:min-h-screen"
                    className="h-full w-full"
                >
                    {children}
                </main>
            </div>

            <Toaster />
        </SidebarProvider>
    );
}
