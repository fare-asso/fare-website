import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { redirect } from "next/navigation"
import "../globals.css"
import Header from "@/components/espaceAsso/header"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Espace Asso",
    description: "Espace de gestion des associations de la FARE"
}

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    // Check authentication
    const user = await getCurrentUserWithPermissions()

    if (!user) {
        redirect("/login")
    }

    // TODO: Add permission check for access:espace-asso when implementing the feature

    return (
        <html lang="en">
            <body className={inter.className}>
                <main className="flex min-h-screen flex-col items-center">
                    <Header />
                    <div className="flex w-full flex-1 flex-col items-center p-10">
                        {children}
                    </div>
                </main>
            </body>
        </html>
    )
}
