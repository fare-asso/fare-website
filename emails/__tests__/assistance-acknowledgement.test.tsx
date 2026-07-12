import { render } from "react-email"
import { describe, expect, it } from "vitest"

import AssistanceAck from "../assistance-acknowledgement"

describe("AssistanceAck email", () => {
    it("renders the situation label and configured delay", async () => {
        const html = await render(
            <AssistanceAck
                situationLabel="À l'extérieur ou autre problème"
                delay="72h"
            />
        )
        expect(html).toContain("extérieur ou autre problème")
        expect(html).toContain("72h")
    })
})
