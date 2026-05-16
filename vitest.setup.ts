import { afterAll, afterEach, beforeAll, vi } from "vitest"
import { server } from "./src/test/msw"

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))

afterEach(() => {
    server.resetHandlers()
    vi.clearAllMocks()
})

afterAll(() => server.close())
