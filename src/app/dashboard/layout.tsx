import type { Metadata } from "next";
import "../globals.css";
import SideBar from "@/components/dashboard/sideBar";

import { Toaster } from "@/components/ui/toaster";

import CurrentUser from "@/components/dashboard/currentUser";
import SignOutButton from "@/components/dashboard/signOutButton";

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
        <div className="flex h-screen flex-col lg:flex-row">
            <SideBar>
                <CurrentUser />
                <SignOutButton />
            </SideBar>
            <main className="flex h-[90%] w-full flex-col items-center lg:h-screen lg:max-h-screen lg:min-h-screen">
                {children}
            </main>
            <Toaster />
        </div>
    );
}
