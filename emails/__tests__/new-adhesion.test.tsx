import { render } from "@react-email/render"
import { describe, expect, it } from "vitest"
import AdhesionTemplate from "../new-adhesion"

describe("AdhesionTemplate email", () => {
    it("renders the association name and dashboard link", async () => {
        const html = await render(
            <AdhesionTemplate associationName="BDE Test" />
        )
        expect(html).toContain("BDE Test")
        expect(html).toContain("/dashboard/adhesions")
    })
})
