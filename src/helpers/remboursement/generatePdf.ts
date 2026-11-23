import { readFile } from "node:fs/promises"
import path from "node:path"

import { format } from "date-fns"
import { PDFDocument, type PDFPage, rgb, StandardFonts } from "pdf-lib"

import type { Remboursement } from "@/generated/prisma/client"

const WIDTH = 595.28
const HEIGHT = 841.89
const HEADER_BLUE = rgb(0.09, 0.22, 0.48)

const DEMANDEUR_LABELS: Record<string, string> = {
    bureauTerritorial: "Membre du Bureau Territorial",
    equipeTerritoriale: "Membre de l'Équipe Territoriale",
    adminFARE: "Administrateur·ice de la FARE"
}

const TYPE_LABELS: Record<string, string> = {
    train: "Déplacement en train",
    voiture: "Déplacement en voiture",
    metroBus: "Tickets de métro / bus",
    car: "Déplacement en car",
    achat: "Achat avec facture"
}

// StandardFonts.Helvetica uses WinAnsi (latin1 + a subset of cp1252).
function toWinAnsi(text: string): string {
    return text
        .replace(/→/g, "->")
        .replace(/…/g, "...")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[^\x20-\x7E\xA0-\xFFŒœŠšŸŽž€]/g, " ")
}

export async function generateRemboursementPdfFromRecord(
    record: Remboursement
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const logoBytes = await readFile(
        path.join(process.cwd(), "src", "assets", "logo_fare.png")
    )
    const logoImage = await pdfDoc.embedPng(logoBytes)

    let yPosition = 0

    const addHeader = (page: PDFPage): void => {
        page.drawRectangle({
            x: 0,
            y: HEIGHT - 61,
            width: WIDTH,
            height: 12,
            color: HEADER_BLUE
        })
        page.drawRectangle({
            x: 100,
            y: HEIGHT - 95,
            width: 100,
            height: 80,
            color: rgb(1, 1, 1)
        })
        const logoDims = logoImage.scaleToFit(88, 72)
        page.drawImage(logoImage, {
            x: 106 + (88 - logoDims.width) / 2,
            y: HEIGHT - 91 + (72 - logoDims.height) / 2,
            ...logoDims
        })
    }

    const createPage = (): PDFPage => {
        const page = pdfDoc.addPage([WIDTH, HEIGHT])
        addHeader(page)
        yPosition = HEIGHT - 121
        return page
    }

    let page = createPage()

    const ensureSpace = (needed = 30): void => {
        if (yPosition < 60 + needed) {
            page = createPage()
        }
    }

    const addField = (label: string, value: string | number): void => {
        ensureSpace(20)
        page.drawText(toWinAnsi(`${label}: ${value}`), {
            x: 50,
            y: yPosition,
            size: 12,
            font,
            color: rgb(0, 0, 0)
        })
        yPosition -= 16
    }

    const addSectionTitle = (text: string): void => {
        ensureSpace(40)
        const { width } = page.getSize()
        page.drawText(toWinAnsi(text), {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: rgb(0, 0, 0)
        })
        page.drawLine({
            start: { x: 50, y: yPosition - 5 },
            end: { x: width - 50, y: yPosition - 5 },
            thickness: 1,
            color: rgb(0, 0, 0)
        })
        yPosition -= 25
    }

    page.drawText("Demande de remboursement", {
        x: 50,
        y: yPosition,
        size: 25,
        font: boldFont,
        color: rgb(0, 0, 0)
    })
    yPosition -= 50

    addSectionTitle("- IDENTITÉ DU DEMANDEUR -")
    addField("Référence", `#${record.id}`)
    addField(
        "Date de la demande",
        format(new Date(record.createdAt), "dd/MM/yyyy")
    )
    addField(
        "Statut",
        record.archived
            ? `Archivée le ${format(new Date(record.archived), "dd/MM/yyyy")}`
            : "En attente"
    )
    addField("Profil", DEMANDEUR_LABELS[record.demandeur] ?? record.demandeur)
    if (record.association) {
        addField("Association", record.association)
    }
    yPosition -= 10
    addField("Prénom et nom", `${record.prenom} ${record.nom}`)
    addField("Email", record.email)
    addField("Téléphone", record.telephone)
    yPosition -= 20

    addSectionTitle("- DÉTAILS DE LA DEMANDE -")
    addField("Type de remboursement", TYPE_LABELS[record.type] ?? record.type)

    if (record.dateVoyage) {
        addField(
            "Date du voyage",
            format(new Date(record.dateVoyage), "dd/MM/yyyy")
        )
    }
    if (record.depart) {
        addField("Point de départ", record.depart)
    }
    if (record.arrivee) {
        addField("Point d'arrivée", record.arrivee)
    }
    if (record.objet) {
        addField("Objet de l'achat", record.objet)
    }
    if (record.montantTTC) {
        addField("Montant TTC", `${record.montantTTC} €`)
    }
    if (record.personnes) {
        yPosition -= 5
        addField("Personnes présentes dans le véhicule", "")
        for (const line of record.personnes.split(/\r?\n/)) {
            const trimmed = line.trim()
            if (trimmed) {
                ensureSpace(18)
                page.drawText(toWinAnsi(`  - ${trimmed}`), {
                    x: 50,
                    y: yPosition,
                    size: 11,
                    font,
                    color: rgb(0, 0, 0)
                })
                yPosition -= 15
            }
        }
    }
    yPosition -= 20

    addSectionTitle("- PIÈCES JOINTES AU DOSSIER -")
    addField("RIB", record.ribPath ? "1 fichier (rib)" : "Aucun")
    addField(
        "Justificatifs principaux",
        `${record.justificatifsPaths.length} fichier(s)`
    )
    if (record.piecesMetroBusPaths.length > 0) {
        addField(
            "Justificatifs métro / bus complémentaires",
            `${record.piecesMetroBusPaths.length} fichier(s)`
        )
    }
    if (record.justificatifsPassagersPaths.length > 0) {
        addField(
            "Justificatifs passagers (photo / attestations)",
            `${record.justificatifsPassagersPaths.length} fichier(s)`
        )
    }

    return pdfDoc.save()
}
