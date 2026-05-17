import type { Contact } from "@/schemas/contact"

export function validContact(overrides: Partial<Contact> = {}): Contact {
    return {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean@example.com",
        message: "Bonjour, je souhaite vous contacter.",
        captchaToken: "token-123",
        ...overrides
    }
}
