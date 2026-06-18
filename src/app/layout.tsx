import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
    title: {
        template: "%s | FARE",
        default: "FARE"
    },
    description:
        "Fédération des Associations du Réseau Étudiant de Haute-Bretagne"
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <NuqsAdapter defaultOptions={{ clearOnDefault: false }}>
                    {children}
                </NuqsAdapter>
            </body>
        </html>
    )
}
