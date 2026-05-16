import { HttpResponse, http } from "msw"
import { describe, expect, it } from "vitest"
import { captchaUrl, server } from "@/test/msw"
import { verifyCaptcha } from "./verify"

describe("verifyCaptcha", () => {
    it("returns true when the API reports success", async () => {
        await expect(verifyCaptcha("token")).resolves.toBe(true)
    })

    it("returns false when the API reports failure", async () => {
        server.use(
            http.post(captchaUrl, () =>
                HttpResponse.json({
                    success: false,
                    error: { error_code: "response_invalid", detail: "x" }
                })
            )
        )
        await expect(verifyCaptcha("token")).resolves.toBe(false)
    })

    it("sends the sitekey, token and API key", async () => {
        let body: { sitekey?: string; response?: string } = {}
        let apiKey: string | null = null
        server.use(
            http.post(captchaUrl, async ({ request }) => {
                body = await request.json()
                apiKey = request.headers.get("X-API-Key")
                return HttpResponse.json({ success: true })
            })
        )

        await verifyCaptcha("my-token")

        expect(body.response).toBe("my-token")
        expect(body.sitekey).toBe("test-site-key")
        expect(apiKey).toBe("test-fc-api-key")
    })
})
