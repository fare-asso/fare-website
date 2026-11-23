import type { TRemboursementForm } from "@/schemas/remboursement"
import { pdfFile } from "@/test/factories/files"

export function validRemboursementForm(
    overrides: Partial<TRemboursementForm> = {}
): TRemboursementForm {
    return {
        demandeur: "adminFARE",
        association: "BDE Rennes",
        prenom: "Marie",
        nom: "Durand",
        email: "marie.durand@fare-asso.fr",
        telephone: "0612345678",
        rib: pdfFile("rib.pdf"),
        type: "train",
        dateVoyage: new Date("2026-11-20T00:00:00.000Z"),
        depart: "Rennes",
        arrivee: "Paris",
        justificatifs: [pdfFile("billet-train.pdf")],
        captchaToken: "token-123",
        ...overrides
    }
}
