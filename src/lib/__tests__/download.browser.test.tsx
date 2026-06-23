import { afterEach, describe, expect, it, vi } from "vitest"

import { downloadBase64 } from "../download"

// base64 of "hi"
const HI = "aGk="

afterEach(() => {
    vi.restoreAllMocks()
})

describe("downloadBase64", () => {
    it("creates a Blob with the given mime type and clicks an anchor", () => {
        let captured: Blob | undefined
        const createObjectURL = vi
            .spyOn(URL, "createObjectURL")
            .mockImplementation((b: Blob | MediaSource) => {
                captured = b as Blob
                return "blob:mock"
            })
        const revokeObjectURL = vi
            .spyOn(URL, "revokeObjectURL")
            .mockImplementation(() => {})
        const click = vi
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => {})

        downloadBase64(HI, "candidatures.zip", "application/zip")

        expect(click).toHaveBeenCalledOnce()
        expect(captured?.type).toBe("application/zip")
        expect(captured?.size).toBe(2)
        expect(createObjectURL).toHaveBeenCalledOnce()
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock")
    })

    it("sets the download attribute to the filename", () => {
        const realCreate = document.createElement.bind(document)
        let anchor: HTMLAnchorElement | undefined
        vi.spyOn(document, "createElement").mockImplementation(
            (tag: string) => {
                const el = realCreate(tag)
                if (tag === "a") anchor = el as HTMLAnchorElement
                return el
            }
        )
        vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock")
        vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
            () => {}
        )

        downloadBase64(HI, "my-file.csv", "text/csv")

        expect(anchor?.download).toBe("my-file.csv")
    })
})
