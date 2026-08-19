import { QueryClientProvider } from "@tanstack/react-query"

import { queryClient } from "@/lib/queryClient"

import { Toaster } from "../ui/sonner"

export function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
        </QueryClientProvider>
    )
}
