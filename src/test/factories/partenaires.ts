import type {
    TAddPartenaire,
    TEditPartenaire
} from "@/app/(public)/a-propos/partenaires/partenaires-schema"
import type { Partenaire } from "@/generated/prisma/client"

import { imageFile } from "./files"

export function validAddPartenaire(
    overrides: Partial<TAddPartenaire> = {}
): TAddPartenaire {
    return {
        name: "ACME",
        description: "Un partenaire de la Federation.",
        logo: imageFile("logo.png"),
        ...overrides
    }
}

export function validEditPartenaire(
    overrides: Partial<TEditPartenaire> = {}
): TEditPartenaire {
    return {
        id: 1,
        name: "ACME",
        description: "Un partenaire de la Federation.",
        ...overrides
    }
}

export function validPartenaireRecord(
    overrides: Partial<Partenaire> = {}
): Partenaire {
    return {
        id: 1,
        name: "ACME",
        description: "Un partenaire de la Federation.",
        logoPath: "uuid-acme.png",
        ...overrides
    }
}
