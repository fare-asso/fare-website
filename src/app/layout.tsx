import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
    title: "FARE",
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
                {children}
                <SpeedInsights />
            </body>
        </html>
    )
}
