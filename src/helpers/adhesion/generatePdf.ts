import { readFile } from "node:fs/promises"
import path from "node:path"

import { type } from "arktype"
import { format } from "date-fns"
import { PDFDocument, type PDFPage, rgb, StandardFonts } from "pdf-lib"

import {
    type BureauMember,
    bureauMemberSchema
} from "@/app/(public)/a-propos/adhesion/form-schema"
import type { Adhesion } from "@/generated/prisma/client"

interface AdhesionPdfData {
    dateAdhesion: Date
    sigle: string
    nomComplet: string
    college: string
    objetPrincipal: string
    adresseAdministrative: string
    siegeSocial: string
    numeroSalle: string
    dateAG: Date | null
    nombreEtudiantsRepresentes: number
    nombreAdherents: number
    engagementCotisation: boolean
    emailAssociation: string
    telephonePortable: string
    telephoneFixe: string
    bureau: BureauMember[]
}

/**
 * Generates the adhesion PDF document.
 * Returns the PDF as a Uint8Array ready for upload.
 */
export async function generateAdhesionPdf(
    data: AdhesionPdfData
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const logoBytes = await readFile(
        path.join(process.cwd(), "public", "logo_fare.png")
    )
    const logoImage = await pdfDoc.embedPng(logoBytes)

    // Track vertical position across pages
    let yPosition = 0

    const addCornerLabel = (page: PDFPage) => {
        const logoDims = logoImage.scale(0.075)
        const { height } = page.getSize()
        page.drawImage(logoImage, {
            x: 10,
            y: -5 + height - logoDims.height,
            width: logoDims.width,
            height: logoDims.height
        })
    }

    const createPage = (): PDFPage => {
        const page = pdfDoc.addPage()
        addCornerLabel(page)
        const { height } = page.getSize()
        yPosition = height - 75
        return page
    }

    const addField = (
        page: PDFPage,
        label: string,
        value: string | number | boolean
    ) => {
        page.drawText(`${label}: ${value}`, {
            x: 50,
            y: yPosition,
            size: 12,
            font,
            color: rgb(0, 0, 0)
        })
        yPosition -= 15
    }

    const addSectionTitle = (page: PDFPage, text: string) => {
        const { width } = page.getSize()
        page.drawText(text, {
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

    // --- Page 1: General info ---
    const page = createPage()

    page.drawText("Formulaire d'adhésion", {
        x: 50,
        y: yPosition,
        size: 25,
        font: boldFont,
        color: rgb(0, 0, 0)
    })
    yPosition -= 50

    addSectionTitle(page, "- CARTE D'IDENTITÉ DE L'ASSOCIATION -")
    addField(page, "Nom complet de l'association", data.nomComplet)
    addField(page, "Sigle de l'association", data.sigle)
    addField(page, "Date d'adhésion", format(data.dateAdhesion, "dd/MM/yyyy"))
    yPosition -= 10
    addField(page, "Email de l'association", data.emailAssociation)
    addField(
        page,
        "Téléphone portable de l'association",
        data.telephonePortable
    )
    addField(
        page,
        "Téléphone fixe de l'association (si existant)",
        data.telephoneFixe || "Non spécifié"
    )
    yPosition -= 20

    addSectionTitle(page, "- OBJECTIFS DE L'ASSOCIATION -")
    addField(page, "Collège de l'association", data.college)
    addField(page, "Objet principal de l'association", data.objetPrincipal)
    yPosition -= 20

    addSectionTitle(page, "- LOCALISATION -")
    addField(page, "Adresse administrative", data.adresseAdministrative)
    addField(
        page,
        "Siège social (si différent)",
        data.siegeSocial || "Non spécifié"
    )
    addField(
        page,
        "Numéro de salle (si existant)",
        data.numeroSalle || "Non spécifié"
    )
    yPosition -= 20

    addSectionTitle(page, "- REPRÉSENTATION -")
    addField(
        page,
        "Date de la dernière Assemblée Générale",
        data.dateAG ? format(data.dateAG, "dd/MM/yyyy") : "Non spécifiée"
    )
    addField(
        page,
        "Nombre d'étudiants représentés",
        data.nombreEtudiantsRepresentes
    )
    addField(
        page,
        "Nombre d'adhérents actuel de l'association",
        data.nombreAdherents
    )
    yPosition -= 20

    addSectionTitle(page, "- COTISATION -")
    addField(
        page,
        "Engagement de cotisation",
        data.engagementCotisation ? "Oui" : "Non"
    )

    // --- Page 2: Bureau members ---
    const memberPage = createPage()

    memberPage.drawText("Membres du bureau:", {
        x: 50,
        y: yPosition,
        size: 18,
        font,
        color: rgb(0, 0, 0)
    })
    yPosition -= 36

    for (const member of data.bureau) {
        addField(
            memberPage,
            `${member.poste}`,
            `${member.prenom} ${member.nom} (${member.email}) (${member.telephone})`
        )
        addField(memberPage, "Admin", member.isAdmin ? "Oui" : "Non")
        addField(
            memberPage,
            "Années d'études",
            `${member.annee} (${member.filiere})`
        )
        addField(memberPage, "Adresse", member.adresse)
        yPosition -= 20
    }

    return pdfDoc.save()
}

/**
 * Builds the adhesion PDF from a stored database record
 */
export async function generateAdhesionPdfFromRecord(
    adhesion: Adhesion
): Promise<Uint8Array> {
    const parsedBureau = bureauMemberSchema.array()(adhesion.bureau ?? [])
    const bureau = parsedBureau instanceof type.errors ? [] : parsedBureau

    return await generateAdhesionPdf({
        dateAdhesion: adhesion.createdAt,
        sigle: adhesion.sigle,
        nomComplet: adhesion.nomComplet,
        college: adhesion.college,
        objetPrincipal: adhesion.objetPrincipal,
        adresseAdministrative: adhesion.adresseAdministrative,
        siegeSocial: adhesion.siegeSocial,
        numeroSalle: adhesion.numeroSalle,
        dateAG: adhesion.dateAG,
        nombreEtudiantsRepresentes: adhesion.nombreEtudiantsRepresentes,
        nombreAdherents: adhesion.nombreAdherents,
        engagementCotisation: adhesion.engagementCotisation,
        emailAssociation: adhesion.email,
        telephonePortable: adhesion.telephonePortable,
        telephoneFixe: adhesion.telephoneFixe ?? "",
        bureau
    })
}
