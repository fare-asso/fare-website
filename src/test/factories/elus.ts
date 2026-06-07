import type { Elu } from "@/generated/prisma/client"
import type { TAddElu, TBulkImportElu, TEditElu } from "@/schemas/elu"

export function validAddElu(overrides: Partial<TAddElu> = {}): TAddElu {
    return {
        conseilId: 1,
        name: "Jean Dupont",
        position: "Président",
        ...overrides
    }
}

export function validEditElu(overrides: Partial<TEditElu> = {}): TEditElu {
    return {
        id: 1,
        conseilId: 1,
        name: "Jean Dupont",
        position: "Président",
        ...overrides
    }
}

export function validBulkImportElu(
    overrides: Partial<TBulkImportElu> = {}
): TBulkImportElu {
    return {
        conseilId: 1,
        elus: [
            { name: "Jean Dupont", position: "Président" },
            { name: "Marie Martin", position: "Trésorière" }
        ],
        ...overrides
    }
}

export function validEluRecord(overrides: Partial<Elu> = {}): Elu {
    return {
        id: 1,
        name: "Jean Dupont",
        position: "Président",
        description: null,
        order: 0,
        deletedAt: null,
        conseilId: 1,
        ...overrides
    }
}
