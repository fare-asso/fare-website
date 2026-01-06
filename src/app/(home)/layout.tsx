import "../globals.css"

import Script from "next/script"
import Footer from "@/components/footer/footer"
import Header from "@/components/header/header"

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <main className="flex min-h-screen flex-col items-center">
            <Header />
            <div className="flex w-full flex-1 flex-col items-center p-4 lg:p-10">
                {children}
            </div>
            <Footer />
            <Script
                defer
                src="https://a.fare-asso.fr/script.js"
                data-website-id="7133dde1-d746-40d0-b0b2-9ec15d49c711"
            />
        </main>
    )
}
