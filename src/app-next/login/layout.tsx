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
        <main className="grid min-h-screen place-items-center items-center p-2">
            {children}
        </main>
    )
}
