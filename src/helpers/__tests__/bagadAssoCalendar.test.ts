import { describe, expect, it } from "vitest"

import { buildBagadAssoCalendar } from "@/helpers/bagadAssoCalendar"
import { bagadAssoTicketRecord } from "@/test/factories/bagadAsso"

describe("buildBagadAssoCalendar", () => {
    it("wraps events in a valid VCALENDAR with CRLF endings", () => {
        const ics = buildBagadAssoCalendar([bagadAssoTicketRecord()])
        expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true)
        expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true)
        expect(ics).toContain("VERSION:2.0")
        expect(ics).toContain("PRODID:-//FARE//Bagad'Asso//FR")
        expect(ics).toMatch(/\r\n/)
    })

    it("emits one all-day VEVENT per ticket with stable UIDs", () => {
        const ics = buildBagadAssoCalendar([
            bagadAssoTicketRecord({ id: 7 }),
            bagadAssoTicketRecord({ id: 8 })
        ])
        expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
        expect(ics).toContain("UID:bagad-asso-7@fare-asso.fr")
        expect(ics).toContain("UID:bagad-asso-8@fare-asso.fr")
        expect(ics).toContain("DTSTART;VALUE=DATE:20260901")
        expect(ics).toContain("DTSTAMP:20260101T000000Z")
    })

    it("includes contact details in the description", () => {
        const ics = buildBagadAssoCalendar([bagadAssoTicketRecord()])
        const unfolded = ics.replace(/\r\n /g, "")
        expect(unfolded).toContain("lea@example.com")
        expect(unfolded).toContain("0612345678")
    })

    it("escapes special characters in text fields", () => {
        const ics = buildBagadAssoCalendar([
            bagadAssoTicketRecord({
                eventName: "Gala; soirée, déguisée\\",
                association: "Asso"
            })
        ])
        const summary = ics
            .split("\r\n")
            .find((line) => line.startsWith("SUMMARY:"))
        expect(summary).toBe("SUMMARY:Gala\\; soirée\\, déguisée\\\\ (Asso)")
    })

    it("uses the location displayName for a JSON-encoded address", () => {
        const ics = buildBagadAssoCalendar([
            bagadAssoTicketRecord({
                eventAddr: JSON.stringify({
                    displayName: "Salle Test",
                    coordinates: { lat: "48.1", lon: "-1.6" }
                })
            })
        ])
        expect(ics).toContain("LOCATION:Salle Test")
        expect(ics).not.toContain("coordinates")
    })

    it("returns a valid empty calendar when there are no tickets", () => {
        const ics = buildBagadAssoCalendar([])
        expect(ics).toContain("BEGIN:VCALENDAR")
        expect(ics).toContain("END:VCALENDAR")
        expect(ics).not.toContain("BEGIN:VEVENT")
    })
})
