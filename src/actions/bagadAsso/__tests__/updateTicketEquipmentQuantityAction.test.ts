import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
    bagadAssoEquipmentRecord,
    bagadAssoTicketRecord
} from "@/test/factories/bagadAsso"
import { mockUser } from "@/test/factories/user"
import { dbModule, sentryModule, supabaseAstroModule } from "@/test/mocks"

const h = vi.hoisted(() => ({
    findTicket: vi.fn(),
    findEquipment: vi.fn(),
    update: vi.fn(),
    getUser: vi.fn(),
    captureActionError: vi.fn()
}))

vi.mock("@/helpers/db", () =>
    dbModule({
        bagadAssoTicket: { findUnique: h.findTicket, updateMany: h.update },
        bagadAssoEquipment: { findUnique: h.findEquipment }
    })
)
vi.mock("@/helpers/supabase/astro", () =>
    supabaseAstroModule({ getUserWithPermissions: h.getUser })
)
vi.mock("@/lib/sentry", () => sentryModule(h.captureActionError))

import { updateTicketEquipmentQuantityAction } from "../updateTicketEquipmentQuantityAction"

const input = { ticketId: 9, equipmentId: 1, quantity: 3 }
const storedEquipments = [
    { id: 2, quantity: 4, name: "Autre matériel", deposit: 25 },
    { id: 1, quantity: 2, name: "Barnum enregistré", deposit: 50 }
]

beforeEach(() => {
    h.getUser.mockResolvedValue(mockUser(["edit:bagad-ticket"]))
    h.findTicket.mockResolvedValue(
        bagadAssoTicketRecord({ id: 9, equipments: storedEquipments })
    )
    h.findEquipment.mockResolvedValue(bagadAssoEquipmentRecord({ quantity: 5 }))
    h.update.mockResolvedValue({ count: 1 })
})

afterEach(() => {
    vi.restoreAllMocks()
})

describe("updateTicketEquipmentQuantityAction", () => {
    it("requires authentication before reading the database", async () => {
        h.getUser.mockResolvedValue(null)
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Authentification requise"
        })
        expect(h.findTicket).not.toHaveBeenCalled()
        expect(h.findEquipment).not.toHaveBeenCalled()
        expect(h.update).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it("requires edit:bagad-ticket rather than equipment permissions", async () => {
        h.getUser.mockResolvedValue(mockUser(["edit:bagad-equipment"]))
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        })
        expect(h.findTicket).not.toHaveBeenCalled()
        expect(h.update).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    describe.each(["ticketId", "equipmentId", "quantity"] as const)(
        "%s validation",
        (field) => {
            it.each([
                0,
                -1,
                1.5,
                Number.NaN,
                Number.POSITIVE_INFINITY,
                Number.NEGATIVE_INFINITY,
                Number.MAX_SAFE_INTEGER + 1,
                "3",
                null,
                undefined
            ])("rejects %s before database IO", async (value) => {
                const payload = { ...input, [field]: value } as typeof input
                expect(
                    await updateTicketEquipmentQuantityAction(payload)
                ).toEqual({
                    success: false,
                    error: "Un ou plusieurs champs sont invalides."
                })
                expect(h.findTicket).not.toHaveBeenCalled()
                expect(h.findEquipment).not.toHaveBeenCalled()
                expect(h.update).not.toHaveBeenCalled()
                expect(h.captureActionError).not.toHaveBeenCalled()
            })
        }
    )

    it.each([
        ["missing", null, "Ticket introuvable"],
        [
            "archived",
            bagadAssoTicketRecord({ deleted: new Date() }),
            "Ce ticket ne peut plus être modifié"
        ],
        [
            "validated",
            bagadAssoTicketRecord({ validated: new Date() }),
            "Ce ticket ne peut plus être modifié"
        ]
    ])("rejects a %s ticket", async (_label, ticket, error) => {
        h.findTicket.mockResolvedValue(ticket)
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error
        })
        expect(h.findEquipment).not.toHaveBeenCalled()
        expect(h.update).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it.each(
        [
            null,
            42,
            {},
            { id: 1, quantity: 2 },
            [null],
            [{ id: 1 }],
            [{ quantity: 2 }],
            [{ id: "1", quantity: 2 }],
            [{ id: 0, quantity: 2 }],
            [{ id: 1.5, quantity: 2 }],
            [{ id: Number.MAX_SAFE_INTEGER + 1, quantity: 2 }],
            [{ id: 1, quantity: 0 }],
            [{ id: 1, quantity: -1 }],
            [{ id: 1, quantity: 1.5 }],
            [{ id: 1, quantity: "2" }],
            [{ id: 1, quantity: Number.MAX_SAFE_INTEGER + 1 }],
            [
                { id: 1, quantity: 2 },
                { id: 2, quantity: -1 }
            ]
        ].map((equipments) => ({ equipments }))
    )(
        "rejects invalid stored equipment data $equipments",
        async ({ equipments }) => {
            h.findTicket.mockResolvedValue(
                bagadAssoTicketRecord({ equipments })
            )
            expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
                success: false,
                error: "Matériel du ticket invalide"
            })
            expect(h.findEquipment).not.toHaveBeenCalled()
            expect(h.update).not.toHaveBeenCalled()
            expect(h.captureActionError).not.toHaveBeenCalled()
        }
    )

    it.each(["null", "{}", '[{"id":1,"quantity":0}]'])(
        "validates legacy data after parsing %s",
        async (equipments) => {
            h.findTicket.mockResolvedValue(
                bagadAssoTicketRecord({ equipments })
            )
            expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
                success: false,
                error: "Matériel du ticket invalide"
            })
            expect(h.update).not.toHaveBeenCalled()
            expect(h.captureActionError).not.toHaveBeenCalled()
        }
    )

    it("captures malformed legacy JSON without updating", async () => {
        h.findTicket.mockResolvedValue(
            bagadAssoTicketRecord({ equipments: "not json" })
        )
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Matériel du ticket invalide"
        })
        expect(h.captureActionError).toHaveBeenCalledExactlyOnceWith(
            expect.any(SyntaxError)
        )
        expect(h.findEquipment).not.toHaveBeenCalled()
        expect(h.update).not.toHaveBeenCalled()
    })

    it.each([{ equipments: [] }, { equipments: [{ id: 2, quantity: 1 }] }])(
        "rejects equipment absent from the stored ticket $equipments",
        async ({ equipments }) => {
            h.findTicket.mockResolvedValue(
                bagadAssoTicketRecord({ equipments })
            )
            expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
                success: false,
                error: "Matériel absent du ticket"
            })
            expect(h.findEquipment).not.toHaveBeenCalled()
            expect(h.update).not.toHaveBeenCalled()
            expect(h.captureActionError).not.toHaveBeenCalled()
        }
    )

    it("rejects equipment missing from inventory", async () => {
        h.findEquipment.mockResolvedValue(null)
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Matériel introuvable"
        })
        expect(h.update).not.toHaveBeenCalled()
        expect(h.captureActionError).not.toHaveBeenCalled()
    })

    it.each([0, 2])(
        "rejects quantity above inventory stock %i",
        async (stock) => {
            h.findEquipment.mockResolvedValue(
                bagadAssoEquipmentRecord({ quantity: stock })
            )
            expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
                success: false,
                error: "La quantité demandée dépasse le stock disponible"
            })
            expect(h.update).not.toHaveBeenCalled()
            expect(h.captureActionError).not.toHaveBeenCalled()
        }
    )

    describe.each(["rejection", "synchronous throw"] as const)(
        "IO %s",
        (failureMode) => {
            it.each([
                ["getUser", "Échec de l'authentification"],
                ["findTicket", "Echec de la récupération du ticket"],
                ["findEquipment", "Echec de la récupération du matériel"],
                ["update", "Echec de la mise à jour du ticket"]
            ] as const)("captures %s failures", async (operation, message) => {
                const error = new Error("sensitive internal details")
                if (failureMode === "rejection") {
                    h[operation].mockRejectedValue(error)
                } else {
                    h[operation].mockImplementation(() => {
                        throw error
                    })
                }
                expect(
                    await updateTicketEquipmentQuantityAction(input)
                ).toEqual({
                    success: false,
                    error: message
                })
                expect(h.captureActionError).toHaveBeenCalledExactlyOnceWith(
                    error
                )
                if (operation !== "update") {
                    expect(h.update).not.toHaveBeenCalled()
                }
            })
        }
    )

    it.each(["JSON array", "legacy string"])(
        "updates only the stored quantity and preserves %s format",
        async (format) => {
            const equipments =
                format === "legacy string"
                    ? JSON.stringify(storedEquipments)
                    : storedEquipments
            h.findTicket.mockResolvedValue(
                bagadAssoTicketRecord({ id: 9, equipments })
            )
            // Extra client metadata must never replace the authoritative data.
            const payload = { ...input, name: "Forged", deposit: 0 }
            expect(await updateTicketEquipmentQuantityAction(payload)).toEqual({
                success: true,
                value: { quantity: 3 }
            })
            const expected = [
                storedEquipments[0],
                { ...storedEquipments[1], quantity: 3 }
            ]
            expect(h.findTicket).toHaveBeenCalledExactlyOnceWith({
                where: { id: 9 }
            })
            expect(h.findEquipment).toHaveBeenCalledExactlyOnceWith({
                where: { id: 1 },
                select: { quantity: true }
            })
            expect(h.update).toHaveBeenCalledExactlyOnceWith({
                where: {
                    id: 9,
                    deleted: null,
                    validated: null,
                    equipments: { equals: equipments }
                },
                data: {
                    equipments:
                        format === "legacy string"
                            ? JSON.stringify(expected)
                            : expected
                }
            })
            expect(storedEquipments[1]?.quantity).toBe(2)
            expect(h.captureActionError).not.toHaveBeenCalled()
        }
    )

    it.each([1, 2, 5, Number.MAX_SAFE_INTEGER])(
        "accepts quantity %i including unchanged quantities and exact stock",
        async (quantity) => {
            h.findEquipment.mockResolvedValue(
                bagadAssoEquipmentRecord({ quantity })
            )
            expect(
                await updateTicketEquipmentQuantityAction({
                    ...input,
                    quantity
                })
            ).toEqual({ success: true, value: { quantity } })
            expect(h.update).toHaveBeenCalledExactlyOnceWith({
                where: {
                    id: 9,
                    deleted: null,
                    validated: null,
                    equipments: { equals: storedEquipments }
                },
                data: {
                    equipments: [
                        storedEquipments[0],
                        { ...storedEquipments[1], quantity }
                    ]
                }
            })
        }
    )

    it.each(["JSON array", "legacy string"])(
        "returns an expected conflict when the guarded write no longer matches (%s)",
        async (format) => {
            const equipments =
                format === "legacy string"
                    ? JSON.stringify(storedEquipments)
                    : storedEquipments
            h.findTicket.mockResolvedValue(
                bagadAssoTicketRecord({ id: 9, equipments })
            )
            h.update.mockResolvedValue({ count: 0 })

            expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
                success: false,
                error: "Ce ticket a été modifié entre-temps. Veuillez le recharger."
            })
            const expected = [
                storedEquipments[0],
                { ...storedEquipments[1], quantity: input.quantity }
            ]
            expect(h.update).toHaveBeenCalledExactlyOnceWith({
                where: {
                    id: 9,
                    deleted: null,
                    validated: null,
                    equipments: { equals: equipments }
                },
                data: {
                    equipments:
                        format === "legacy string"
                            ? JSON.stringify(expected)
                            : expected
                }
            })
            expect(h.captureActionError).not.toHaveBeenCalled()
        }
    )

    it("captures legacy serialization failures without writing", async () => {
        h.findTicket.mockResolvedValue(bagadAssoTicketRecord({ id: 9 }))
        const error = new Error("serialization failed")
        vi.spyOn(JSON, "stringify").mockImplementationOnce(() => {
            throw error
        })
        expect(await updateTicketEquipmentQuantityAction(input)).toEqual({
            success: false,
            error: "Echec de la mise à jour du ticket"
        })
        expect(h.captureActionError).toHaveBeenCalledExactlyOnceWith(error)
        expect(h.update).not.toHaveBeenCalled()
    })
})
