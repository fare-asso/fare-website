import type { AssistanceConfig } from "@/generated/prisma/client"
import type { TAssistanceForm } from "@/schemas/assistance"

export function validAssistanceForm(
    overrides: Partial<TAssistanceForm> = {}
): TAssistanceForm {
    return {
        prenom: "Marie",
        nom: "Durand",
        email: "marie.durand@etudiant.fr",
        etablissement: "Université de Rennes",
        ufr: "UFR Droit et science politique",
        situation: "univ",
        message: "Bonjour, je rencontre un problème avec un examen.",
        moyenContact: "email",
        telephone: "",
        pieces: [],
        consentement: true,
        captchaToken: "token-123",
        ...overrides
    }
}

export function assistanceConfigRecord(
    overrides: Partial<AssistanceConfig> = {}
): AssistanceConfig {
    return {
        id: 1,
        recipientEmail: "defense-des-droits@fare-asso.fr",
        delay: "48h",
        ...overrides
    }
}
