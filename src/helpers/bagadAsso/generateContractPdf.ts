import { readFile } from "node:fs/promises"
import path from "node:path"

import {
    PDFDocument,
    type PDFFont,
    type PDFPage,
    rgb,
    StandardFonts
} from "pdf-lib"

import type { BagadAssoTicket } from "@/generated/prisma/client"

import { addBorrowerSignatureField } from "./signatureField"

export interface ContractEquipment {
    id: number
    name: string
    quantity: number
    deposit: number
}

interface ContractSection {
    title: string
    paragraphs: string[]
    communication?: boolean
}

interface ContractPdfOptions {
    today?: Date
    includeCommunication?: boolean
}

const WIDTH = 595.28
const HEIGHT = 841.89
const MARGIN = 62
const TEXT_WIDTH = WIDTH - 2 * MARGIN
const BOTTOM = 62
const FONT_SIZE = 11
const LINE_HEIGHT = 15
const BLUE = rgb(0.09, 0.22, 0.48)
const INK = rgb(0.12, 0.14, 0.19)

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Europe/Paris"
    }).format(date)
}

function formatMoney(amount: number): string {
    return `${amount.toFixed(2).replace(".", ",")} €`
}

/** Resolves the Word document's placeholders without changing its legal wording. */
function contractText(
    ticket: BagadAssoTicket,
    equipments: ContractEquipment[],
    today: Date,
    includeCommunication: boolean
): { introduction: string[]; sections: ContractSection[]; closing: string[] } {
    const deposit =
        equipments.reduce(
            (total, equipment) =>
                total +
                Math.round(equipment.deposit * 100) * equipment.quantity,
            0
        ) / 100
    const values: Record<string, string> = {
        nom_asso: ticket.association,
        nom_rep: `${ticket.firstName} ${ticket.lastName}`,
        qualite: ticket.position,
        materiel: equipments
            .map((equipment) => `- ${equipment.quantity} x ${equipment.name}`)
            .join("\n"),
        evenement: ticket.eventName,
        date_debut: formatDate(ticket.eventDate),
        date_fin: formatDate(ticket.eventEndDate ?? ticket.eventDate),
        caution: formatMoney(deposit),
        detail_caution: equipments
            .map(
                (equipment) =>
                    `${equipment.quantity} x ${equipment.name} (${formatMoney(equipment.deposit)} par unité)`
            )
            .join(", "),
        date_jour: formatDate(today)
    }
    const fill = (text: string): string =>
        text.replace(/{{\s*(\w+)\s*}}/g, (_match, key: string) => {
            const value = values[key]
            if (value === undefined)
                throw new Error(`Champ du contrat inconnu : ${key}`)
            return value
        })
    const introduction = [
        "Ce contrat a pour objectif de finaliser la mise en place du projet Bagad’Asso de la FARE (Fédération des Associations du Réseau Étudiant de Haute Bretagne), afin de faciliter l’utilisation de ce projet, il est représenté par Colin OZANNE, en qualité de Président,",
        "Ci-après dénommé « la FARE »,",
        "Et :",
        "L'Association {{ nom_asso }},\nReprésentée par {{ nom_rep }}, en qualité de {{ qualite }},\nCi-après dénommée « l'Emprunteur »,",
        "Il a été convenu ce qui suit :"
    ]
    const sections: ContractSection[] = [
        {
            title: "Article 1 : Objet du contrat",
            paragraphs: [
                "Le présent contrat a pour objet de définir les conditions et modalités de la Bagad’Asso de la FARE à l'Association {{ nom_asso }} ."
            ]
        },
        {
            title: "Article 2 : Description du matériel prêté",
            paragraphs: [
                "La FARE met à la disposition de l'Emprunteur le matériel suivant :",
                "{{ materiel }}"
            ]
        },
        {
            title: "Article 3 : Durée du prêt",
            paragraphs: [
                "Le prêt est consenti durant {{ evenement }} de l’association {{ nom_asso }} à compter du {{ date_debut }} et jusqu'au {{ date_fin }} .\nLe prêt peut être prolongé d’un commun accord entre les deux parties sous réserve de la signature d’un avenant au présent contrat."
            ]
        },
        {
            title: "Article 4 : Utilisation du matériel",
            paragraphs: [
                "L'Emprunteur s'engage à :",
                "Utiliser le matériel conformément à sa destination et aux instructions d’utilisation fournies par le fabricant.",
                "Prendre toutes les mesures nécessaires pour assurer la bonne conservation et le bon fonctionnement du matériel.",
                "Ne pas prêter, sous-louer ou céder le matériel à un tiers sans l’autorisation préalable et écrite de la FARE."
            ]
        },
        {
            title: "Article 5 : Caution",
            paragraphs: [
                "En garantie de la bonne utilisation et de la restitution du matériel, l'Emprunteur verse une caution de {{ caution }}, correspondant à : {{ detail_caution }} conformément à la fiche informative du projet Bagad’Asso.",
                "Cette caution sera restituée à l'Emprunteur à la fin du prêt, sous réserve de la restitution du matériel en bon état et du respect de l'ensemble des obligations contractuelles. En cas de dégradation, perte ou vol du matériel, tout ou partie de la caution pourra être retenue pour couvrir les frais de réparation ou de remplacement.",
                "L’absence de chèque de caution au moment de la mise à disposition du matériel ne permet pas la location celui-ci."
            ]
        },
        {
            title: "Article 6 : Responsabilité",
            paragraphs: [
                "L'Emprunteur est responsable de tout dommage, perte ou vol du matériel pendant la durée du prêt. En cas de dégradation, perte ou vol du matériel, l'Emprunteur s'engage à informer immédiatement la FARE et à rembourser le coût de réparation ou de remplacement du matériel, déduction faite de la caution."
            ]
        },
        {
            title: "Article 7 : Restitution du matériel",
            paragraphs: [
                "L'Emprunteur s’engage à restituer le matériel en bon état de fonctionnement et nettoyé à la date de fin du prêt. Tout retard dans la restitution sans accord préalable pourra entraîner des pénalités à hauteur de 5€ par jour de retard sauf si un accord a été établi entre les parties."
            ]
        },
        {
            title: "Article 8 : Communication du projet",
            communication: true,
            paragraphs: [
                "L’Emprunteur s’engage à réaliser au moins une communication sur ses réseaux sociaux lors de l’utilisation du Bagad’Asso, à l’aide du kit de communication fourni avec ledit contrat."
            ]
        },
        {
            title: "Article 9 : Litiges",
            paragraphs: [
                "Tout litige relatif à l'interprétation ou à l'exécution du présent contrat sera soumis aux tribunaux compétents de la Haute Bretagne (Ille-et-Vilaine ou Côtes d’Armor)."
            ]
        },
        {
            title: "Article 10 : Dispositions diverses",
            paragraphs: [
                "Le présent contrat constitue l'intégralité de l'accord entre les parties et annule et remplace tout accord antérieur, oral ou écrit, relatif au même objet.\nToute modification du présent contrat devra faire l'objet d'un avenant signé par les deux parties."
            ]
        }
    ]
    const closing = [
        "Il peut être signé électroniquement ou manuscritement selon l’accord entre les parties.",
        "Fait à Rennes, le {{ date_jour }}."
    ]
    return {
        introduction: introduction.map(fill),
        sections: sections
            .filter((section) => includeCommunication || !section.communication)
            .map(({ title, paragraphs }, index) => ({
                title: title.replace(/^Article \d+/, `Article ${index + 1}`),
                paragraphs: paragraphs.map(fill)
            })),
        closing: closing.map(fill)
    }
}

/** Wraps even long unbroken names so text never escapes the page margins. */
function wrapLines(
    text: string,
    font: PDFFont,
    size: number,
    width: number
): string[] {
    const lines: string[] = []
    for (const paragraph of text.split("\n")) {
        let line = ""
        for (const word of paragraph.split(/\s+/).filter(Boolean)) {
            const candidate = line ? `${line} ${word}` : word
            if (font.widthOfTextAtSize(candidate, size) <= width) {
                line = candidate
                continue
            }
            if (line) lines.push(line)
            line = ""
            for (const letter of word) {
                if (
                    font.widthOfTextAtSize(line + letter, size) > width &&
                    line
                ) {
                    lines.push(line)
                    line = ""
                }
                line += letter
            }
        }
        lines.push(line)
    }
    return lines
}

/** Creates the Bagad'Asso contract as a PDF with an unsigned borrower signature field. */
export async function generateContractPdf(
    ticket: BagadAssoTicket,
    equipments: ContractEquipment[],
    { today = new Date(), includeCommunication = true }: ContractPdfOptions = {}
): Promise<Buffer> {
    const doc = await PDFDocument.create()
    const font = await doc.embedFont(StandardFonts.Helvetica)
    const bold = await doc.embedFont(StandardFonts.HelveticaBold)
    const logo = await doc.embedPng(
        await readFile(path.join(process.cwd(), "src/assets/logo_fare.png"))
    )
    const text = contractText(ticket, equipments, today, includeCommunication)
    let page: PDFPage = doc.addPage([WIDTH, HEIGHT])
    let y = HEIGHT - 121

    const drawHeader = (): void => {
        page.drawRectangle({
            x: 0,
            y: HEIGHT - 61,
            width: WIDTH,
            height: 12,
            color: BLUE
        })
        page.drawRectangle({
            x: 100,
            y: HEIGHT - 95,
            width: 100,
            height: 80,
            color: rgb(1, 1, 1)
        })
        const logoDims = logo.scaleToFit(88, 72)
        page.drawImage(logo, {
            x: 106 + (88 - logoDims.width) / 2,
            y: HEIGHT - 91 + (72 - logoDims.height) / 2,
            ...logoDims
        })
        y = HEIGHT - 121
    }
    const newPage = (): void => {
        page = doc.addPage([WIDTH, HEIGHT])
        drawHeader()
    }
    const ensureSpace = (height: number): void => {
        if (y - height < BOTTOM) newPage()
    }
    const drawParagraph = (
        value: string,
        options: {
            bold?: boolean
            size?: number
            after?: number
            indent?: number
        } = {}
    ): void => {
        const face = options.bold ? bold : font
        const size = options.size ?? FONT_SIZE
        const indent = options.indent ?? 0
        const lines = wrapLines(value, face, size, TEXT_WIDTH - indent)
        for (const line of lines) {
            ensureSpace(LINE_HEIGHT)
            page.drawText(line, {
                x: MARGIN + indent,
                y,
                size,
                font: face,
                color: INK
            })
            y -= LINE_HEIGHT
        }
        y -= options.after ?? 6
    }
    const drawHeading = (value: string): void => {
        ensureSpace(41)
        y -= 3
        drawParagraph(value, { bold: true, size: 12, after: 5 })
    }

    drawHeader()
    const title = "Contrat de prêt Bagad’Asso"
    page.drawText(title, {
        x: (WIDTH - bold.widthOfTextAtSize(title, 18)) / 2,
        y,
        size: 18,
        font: bold,
        color: INK
    })
    y -= 32
    drawParagraph("Entre :", { bold: true, size: 12, after: 9 })
    for (const paragraph of text.introduction) {
        drawParagraph(paragraph, { after: paragraph === "Et :" ? 5 : 7 })
    }
    for (const section of text.sections) {
        drawHeading(section.title)
        for (const paragraph of section.paragraphs) {
            drawParagraph(paragraph)
        }
    }
    for (const paragraph of text.closing) {
        drawParagraph(paragraph, { after: 9 })
    }

    ensureSpace(101)
    y -= 8
    const signatureTop = y
    page.drawText("Pour la FARE :", {
        x: MARGIN,
        y,
        font: bold,
        size: 11,
        color: INK
    })
    page.drawText("Pour l'Emprunteur :", {
        x: WIDTH / 2 + 15,
        y,
        font: bold,
        size: 11,
        color: INK
    })
    y -= 22
    page.drawText("Colin OZANNE", {
        x: MARGIN,
        y,
        font,
        size: FONT_SIZE,
        color: INK
    })
    const signatureDims = logo.scaleToFit(70, 56)
    page.drawImage(logo, {
        x: MARGIN + 12,
        y: y - 65,
        ...signatureDims
    })
    addBorrowerSignatureField(doc, page, {
        x: WIDTH / 2 + 15,
        y: signatureTop - 93,
        width: WIDTH / 2 - MARGIN - 15,
        height: 67
    })

    for (const [index, pdfPage] of doc.getPages().entries()) {
        const label = String(index + 1)
        pdfPage.drawText(label, {
            x: (WIDTH - font.widthOfTextAtSize(label, 9)) / 2,
            y: 34,
            font,
            size: 9,
            color: INK
        })
    }

    return Buffer.from(await doc.save())
}
