import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactElement } from "react"
import { render } from "vitest-browser-react"

export function renderWithClient(ui: ReactElement): ReturnType<typeof render> {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    })
    return render(
        <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    )
}
