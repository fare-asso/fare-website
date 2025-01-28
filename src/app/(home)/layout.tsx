import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FAHB",
    description:
        "Site internet de la Fédération des Associations de Haute-Bretagne",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <main className="flex min-h-screen flex-col items-center">
                    <Header />
                    <div className="flex w-full flex-1 flex-col items-center p-4 lg:p-10">
                        {children}
                    </div>
                    <Footer />
                </main>
            </body>
        </html>
    );
}
