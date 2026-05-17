import type { Association } from "@prisma/client"
import { imageFile } from "./files"

export function validAssociationFormData(
    overrides: Record<string, string | File> = {}
): FormData {
    const fd = new FormData()
    fd.set("name", "Asso Test")
    fd.set("major", "Informatique")
    fd.set("description", "Une association de test")
    fd.set("logo-picture", imageFile("logo.png"))
    fd.set("birthdate", "2020-01-01")
    fd.set("location", "Rennes")
    fd.set("email", "asso@example.com")
    fd.set("website", "https://asso.example.com")
    fd.set("facebook", "")
    fd.set("instagram", "")
    fd.set("twitter", "")
    fd.set("discord", "")
    for (const [key, value] of Object.entries(overrides)) {
        fd.set(key, value)
    }
    return fd
}

export function validAssociationRecord(
    overrides: Partial<Association> = {}
): Association {
    return {
        id: 1,
        name: "Asso Test",
        major: "Informatique",
        desc: "Une association de test",
        location: "Rennes",
        discord: null,
        facebook: null,
        instagram: null,
        logoPath: "association-pictures/logo.png",
        twitter: null,
        website: null,
        birthdate: new Date("2020-01-01T00:00:00Z"),
        representativeId: null,
        email: "asso@example.com",
        officePath: null,
        approved: null,
        adhesionId: null,
        ...overrides
    }
}
