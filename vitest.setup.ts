import { afterAll, afterEach, beforeAll, vi } from "vitest"

import { server } from "./src/test/msw"

// `FileList` is a browser global used by client-side Zod schemas
// (e.g. `@/schemas/members`). It is absent in the node environment, so
// `z.instanceof(FileList)` would throw at module evaluation. A bare stub is
// enough: node-project tests only exercise the server-side schemas.
if (typeof globalThis.FileList === "undefined") {
    class FileListStub {}
    Reflect.set(globalThis, "FileList", FileListStub)
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))

afterEach(() => {
    server.resetHandlers()
    vi.clearAllMocks()
})

afterAll(() => server.close())
