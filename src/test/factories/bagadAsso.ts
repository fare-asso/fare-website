import type { BagadAssoFormData } from "@/components/public/bagadAsso/form-schema"

export function validBagadAssoForm(
    overrides: Partial<BagadAssoFormData> = {}
): BagadAssoFormData {
    return {
        associationName: "Asso Test",
        associationEmail: "asso@example.com",
        referentLastName: "Martin",
        referentFirstName: "Lea",
        referentPosition: "Presidente",
        referentEmail: "lea@example.com",
        referentPhone: "0612345678",
        eventName: "Gala annuel",
        eventType: "Soirée",
        eventAddress: "1 rue de la Paix, 35000 Rennes",
        eventParticipants: 120,
        eventDate: new Date("2026-09-01T00:00:00Z"),
        equipment: JSON.stringify([{ id: 1, quantity: 2 }]),
        termsAccepted: true,
        captchaToken: "token-123",
        ...overrides
    }
}
