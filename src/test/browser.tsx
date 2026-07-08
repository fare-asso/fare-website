import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactElement } from "react"
import { render } from "vitest-browser-react"

// Dashboard islands call react-query hooks (useQuery/useQueryClient) that
// require a provider ancestor (supplied by DashboardShell in production).
// Render them through a fresh client so tests mirror that tree.
export function renderWithClient(ui: ReactElement): ReturnType<typeof render> {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    })
    return render(
        <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    )
}
