import type { Conseil } from "@/generated/prisma/client"
import type { TAddConseil, TEditConseil } from "@/schemas/conseil"

export function validAddConseil(
    overrides: Partial<TAddConseil> = {}
): TAddConseil {
    return {
        instanceId: 1,
        name: "Bureau",
        ...overrides
    }
}

export function validEditConseil(
    overrides: Partial<TEditConseil> = {}
): TEditConseil {
    return {
        id: 1,
        instanceId: 1,
        name: "Bureau",
        ...overrides
    }
}

export function validConseilRecord(overrides: Partial<Conseil> = {}): Conseil {
    return {
        id: 1,
        name: "Bureau",
        description: null,
        order: 0,
        instanceId: 1,
        ...overrides
    }
}
