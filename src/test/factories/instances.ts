import type { Instance } from "@/generated/prisma/client"
import type { TAddInstance, TEditInstance } from "@/schemas/instance"

export function validAddInstance(
    overrides: Partial<TAddInstance> = {}
): TAddInstance {
    return {
        name: "Conseil Municipal",
        contactEmail: "contact@example.com",
        ...overrides
    }
}

export function validEditInstance(
    overrides: Partial<TEditInstance> = {}
): TEditInstance {
    return {
        id: 1,
        name: "Conseil Municipal",
        contactEmail: "contact@example.com",
        ...overrides
    }
}

export function imageFile(name = "logo.png"): File {
    return new File([new Uint8Array([1, 2, 3])], name, { type: "image/png" })
}

export function validInstanceRecord(
    overrides: Partial<Instance> = {}
): Instance {
    return {
        id: 1,
        name: "Conseil Municipal",
        contactEmail: "contact@example.com",
        description: null,
        logoPaths: [],
        order: 0,
        ...overrides
    }
}
