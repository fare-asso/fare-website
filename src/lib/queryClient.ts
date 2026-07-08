import { QueryClient } from "@tanstack/react-query"

// Module-level singleton shared by all dashboard islands.
export const queryClient = new QueryClient()
