import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import SideBar from "@/components/dashboard/sideBar";

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
        <div className="flex flex-row">
          <SideBar/>
          <main className="min-h-screen flex flex-col items-center p-8 w-full">
            {children}
          </main>
        </div>
      </body>
      
    </html>
  );
}
