import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Header from "@/components/espaceAsso/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Espace Asso FAHB",
  description: "Espace de gestion des associations de la FAHB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen flex flex-col items-center">
            <Header />
            <div className="flex flex-col flex-1 items-center p-10 w-full">
                {children}
            </div>
        </main>
        
      </body>
    </html>
  );
}
