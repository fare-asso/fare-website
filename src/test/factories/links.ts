import type {
    TAddLink,
    TAddLinkCategory,
    TEditLink,
    TEditLinkCategory
} from "@/schemas/link"

export function validAddLink(overrides: Partial<TAddLink> = {}): TAddLink {
    return {
        categoryId: 1,
        label: "Notre Instagram",
        url: "https://instagram.com/fare_hautebretagne",
        ...overrides
    }
}

export function validEditLink(overrides: Partial<TEditLink> = {}): TEditLink {
    return { id: 1, ...validAddLink(), ...overrides }
}

export function validAddLinkCategory(
    overrides: Partial<TAddLinkCategory> = {}
): TAddLinkCategory {
    return { name: "Réseaux sociaux", ...overrides }
}

export function validEditLinkCategory(
    overrides: Partial<TEditLinkCategory> = {}
): TEditLinkCategory {
    return { id: 1, name: "Réseaux sociaux", ...overrides }
}
