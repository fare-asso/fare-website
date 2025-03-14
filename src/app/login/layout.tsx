import "../globals.css";

export const metadata = {
    title: "Connection Admin",
    description: "",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex min-h-screen flex-col items-center p-8">
            {children}
        </main>
    );
}
