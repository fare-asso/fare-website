import { type } from "arktype"

export const equipmentTypes = [
    { value: "electronique", label: "Électronique" },
    { value: "son", label: "Son" },
    { value: "lumiere", label: "Lumière" },
    { value: "cuisine", label: "Cuisine" },
    { value: "usage-unique", label: "Usage unique (consommables)" },
    { value: "mobilier", label: "Mobilier" },
    { value: "jeux-animation", label: "Jeux & animation" },
    { value: "securite-prevention", label: "Sécurité & prévention" },
    { value: "autre", label: "Autre" }
] as const

const equipmentTypeValues = equipmentTypes.map((t) => t.value)

export function equipmentTypeLabel(value: string): string {
    return equipmentTypes.find((t) => t.value === value)?.label ?? value
}

export const BagadAssoSuggestionSchema = type({
    equipmentName: "string >= 1",
    equipmentType: type.enumerated(...equipmentTypeValues),
    referenceUrl: 'string.url | ""',
    associationName: "string >= 1",
    firstName: "string >= 1",
    lastName: "string >= 1",
    position: "string >= 1",
    contactEmail: "string.email",
    details: "string",
    captchaToken: "string"
})

export type TBagadAssoSuggestion = typeof BagadAssoSuggestionSchema.infer
