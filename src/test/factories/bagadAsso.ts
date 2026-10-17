import type { BagadAssoFormData } from "@/components/public/bagadAsso/form-schema"
import type {
    BagadAssoEquipment,
    BagadAssoTicket,
    BagadAssoTicketEquipment
} from "@/generated/prisma/client"
import type { TicketWithEquipment } from "@/helpers/bagadAsso/ticketEquipment"
import type { TBagadAssoSuggestion } from "@/schemas/bagadAsso"
import type { TAddEquipment, TEditEquipment } from "@/schemas/bagadEquipment"

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
        eventEndDate: new Date("2026-09-02T00:00:00Z"),
        equipment: JSON.stringify([{ id: 1, quantity: 2 }]),
        termsAccepted: true,
        captchaToken: "token-123",
        ...overrides
    }
}

export function validSuggestionInput(
    overrides: Partial<TBagadAssoSuggestion> = {}
): TBagadAssoSuggestion {
    return {
        equipmentName: "Vidéoprojecteur",
        equipmentType: "electronique",
        referenceUrl: "",
        associationName: "Asso Test",
        firstName: "Lea",
        lastName: "Martin",
        position: "Presidente",
        contactEmail: "lea@example.com",
        details: "",
        captchaToken: "token-123",
        ...overrides
    }
}

export function validEquipmentInput(
    overrides: Partial<TAddEquipment> = {}
): TAddEquipment {
    return {
        name: "Barnum",
        quantity: 2,
        deposit: 50,
        ...overrides
    }
}

export function validEditEquipmentInput(
    overrides: Partial<TEditEquipment> = {}
): TEditEquipment {
    return {
        id: 1,
        name: "Barnum",
        quantity: 2,
        deposit: 50,
        removeImage: false,
        ...overrides
    }
}

export function bagadAssoEquipmentRecord(
    overrides: Partial<BagadAssoEquipment> = {}
): BagadAssoEquipment {
    return {
        id: 1,
        name: "Barnum",
        imagePath: "old.png",
        deletedAt: null,
        deposit: 50,
        quantity: 2,
        ...overrides
    }
}

export function bagadAssoTicketRecord(
    overrides: Partial<BagadAssoTicket> = {}
): BagadAssoTicket {
    return {
        id: 1,
        association: "Asso Test",
        firstName: "Lea",
        lastName: "Martin",
        position: "Presidente",
        phoneNumber: "0612345678",
        eventName: "Gala annuel",
        eventType: "Soirée",
        eventDate: new Date("2026-09-01T00:00:00Z"),
        eventEndDate: new Date("2026-09-02T00:00:00Z"),
        eventAddr: "1 rue de la Paix, 35000 Rennes",
        estimatedParticipants: 120,
        creationDate: new Date("2026-01-01T00:00:00Z"),

        equipmentRevision: 0,
        associationEmail: "asso@example.com",
        representativeEmail: "lea@example.com",
        deleted: null,
        validated: null,
        ...overrides
    }
}

export function bagadAssoTicketEquipmentRecord(
    overrides: Partial<BagadAssoTicketEquipment> = {}
): BagadAssoTicketEquipment {
    return {
        ticketId: 1,
        equipmentId: 1,
        requestedQuantity: 2,
        allocatedQuantity: 2,
        includedInContract: false,
        ...overrides
    }
}

export function bagadAssoTicketWithEquipmentsRecord(
    overrides: Partial<TicketWithEquipment> = {}
): TicketWithEquipment {
    return {
        ...bagadAssoTicketRecord(),
        equipments: [
            {
                ...bagadAssoTicketEquipmentRecord(),
                equipment: bagadAssoEquipmentRecord()
            }
        ],
        ...overrides
    }
}
