import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import SideBar from "@/components/dashboard/sideBar";

import { Toaster } from "@/components/ui/toaster";

import CurrentUser from "@/components/dashboard/currentUser";
import SignOutButton from "@/components/dashboard/signOutButton";

const inter = Inter({ subsets: ["latin"] });

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
        <html lang="en">
            <body className={inter.className}>
                <div className="flex h-screen flex-col lg:flex-row">
                    <SideBar>
                        <CurrentUser />
                        <SignOutButton />
                    </SideBar>
                    <main className="flex h-[90%] w-full flex-col items-center p-4 lg:h-screen lg:max-h-screen lg:min-h-screen lg:p-8">
                        {children}
                    </main>
                    <Toaster />
                </div>
            </body>
        </html>
    );
}
