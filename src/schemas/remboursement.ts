import { type } from "arktype"

import { fileSchema, frenchPhone } from "@/schemas/reusables"

export const MAX_JUSTIFICATIFS = 5
export const MAX_FILE_SIZE = 2 * 1024 * 1024

const justificatifFileSchema = fileSchema({
    mimeType: ["image", "pdf"],
    maxSize: MAX_FILE_SIZE,
    typeErrorMessage: "Formats acceptés : PNG, JPG, WebP ou PDF.",
    sizeErrorMessage: "Chaque fichier doit faire moins de 2 Mo."
})

const justificatifsListSchema = type(justificatifFileSchema)
    .array()
    .atMostLength(MAX_JUSTIFICATIFS)

const nonEmptyString = type("string >= 1").narrow(
    (s, ctx) => s.trim().length > 0 || ctx.reject("requis")
)

export const RemboursementFormSchema = type({
    demandeur: "'bureauTerritorial' | 'equipeTerritoriale' | 'adminFARE'",
    "association?": "string",
    prenom: nonEmptyString,
    nom: nonEmptyString,
    email: "string.email >= 1",
    telephone: frenchPhone.and("string >= 1").as<string>(),
    rib: fileSchema({
        mimeType: ["image", "pdf"],
        maxSize: MAX_FILE_SIZE,
        errorMessage: "Veuillez fournir un RIB.",
        typeErrorMessage: "Formats acceptés : PNG, JPG, WebP, SVG ou PDF.",
        sizeErrorMessage: "Le fichier doit faire moins de 2 Mo."
    }),
    type: "'train' | 'voiture' | 'metroBus' | 'car' | 'achat'",
    "dateVoyage?": "Date | string.date.iso.parse | undefined",
    "depart?": "string",
    "arrivee?": "string",
    justificatifs: justificatifsListSchema.atLeastLength(1),
    "piecesMetroBus?": justificatifsListSchema,
    "personnes?": "string",
    "justificatifsPassagers?": justificatifsListSchema,
    "objet?": "string",
    "montantTTC?": "string",
    captchaToken: "string >= 1"
}).narrow((data, ctx) => {
    let valid = true
    const check = (field: keyof typeof data, ok: boolean): void => {
        if (!ok) {
            ctx.reject({ expected: "requis", path: [field] })
            valid = false
        }
    }

    if (data.demandeur === "adminFARE") {
        check("association", Boolean(data.association?.trim()))
    }

    if (
        data.type === "train" ||
        data.type === "voiture" ||
        data.type === "car"
    ) {
        check(
            "dateVoyage",
            data.dateVoyage instanceof Date &&
                !Number.isNaN(data.dateVoyage.getTime())
        )
        check("depart", Boolean(data.depart?.trim()))
        check("arrivee", Boolean(data.arrivee?.trim()))
    }

    if (data.type === "voiture") {
        check("personnes", Boolean(data.personnes?.trim()))
        check(
            "justificatifsPassagers",
            Boolean(data.justificatifsPassagers?.length)
        )
    }

    if (data.type === "achat") {
        check("objet", Boolean(data.objet?.trim()))
        check(
            "montantTTC",
            /^(?!0+(?:[.,]0{1,2})?$)\d+(?:[.,]\d{1,2})?$/.test(
                data.montantTTC?.trim() ?? ""
            )
        )
    }

    return valid
})

export type TRemboursementForm = typeof RemboursementFormSchema.infer
