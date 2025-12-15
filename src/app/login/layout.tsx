import "../globals.css"

import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Connexion",
    description: "Page de connexion pour les administrateur·ice·s"
}

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <main className="flex min-h-screen flex-col items-center p-8">
            {children}
        </main>
    )
}
