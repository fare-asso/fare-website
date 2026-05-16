import { type } from "arktype"
import { z } from "zod/mini"
import { fileSchema, frenchPhone } from "@/schemas/reusables"

export const SITUATIONS = {
    univ: {
        label: "À l'université / mon établissement",
        example:
            "Ex. : problème avec unE enseignantE, scolarité, examens, jury, stage…"
    },
    exterieur: {
        label: "À l'extérieur ou autre problème",
        example:
            "Ex. : logement / CROUS, bourse, discrimination, précarité, autre…"
    }
} as const

export const MOYEN_CONTACT = {
    email: "Email",
    telephone: "Téléphone"
} as const

const piecesSchema = z
    .array(
        fileSchema({
            mimeType: ["image", "pdf"],
            typeErrorMessage: "Formats acceptés : PNG, JPG, WebP, SVG ou PDF."
        })
    )
    .check(z.maxLength(3, { error: "Maximum 3 fichiers." }))

export const AssistanceFormSchema = type({
    prenom: "string >= 1",
    nom: "string >= 1",
    email: "string.email >= 1",
    etablissement: "string >= 1",
    "ufr?": "string",
    situation: "'univ' | 'exterieur'",
    message: "string >= 1",
    moyenContact: "'email' | 'telephone'",
    "telephone?": frenchPhone,
    "pieces?": piecesSchema,
    consentement: "true",
    captchaToken: "string >= 1"
}).narrow((data, ctx) => {
    if (
        data.moyenContact === "telephone" &&
        !(data.telephone && data.telephone.trim().length > 0)
    ) {
        return ctx.reject({
            expected: "un numéro de téléphone",
            path: ["telephone"]
        })
    }
    return true
})

export type TAssistanceForm = typeof AssistanceFormSchema.infer
