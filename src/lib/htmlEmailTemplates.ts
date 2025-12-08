import process from "node:process"
import type { BTPTutorApplication as BTPTutorApplicationPrisma } from "@prisma/client"
import { format } from "date-fns"
import type {
    BTPTutorApplication,
    BTPTutorQuestion
} from "@/schemas/bougeTaPrison"
import type { Contact } from "@/schemas/contact"

export const adhesionEmailTemplate = (associationName: string): string => `
            <p>Une nouvelle adhésion a été reçue pour l'association <strong>${associationName}</strong>.</p>
            <p>Vous pouvez consulter les détails de cette adhésion dans le <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/adhesions">tableau de bord des adhésions</a>.</p>
            `

export const bagadAssoTicketEmailTemplate = (
    ticketId: number,
    associationName: string,
    eventDate: Date,
    eventName: string
): string => `
            <p>Un nouveau ticket Bagad'Asso à été soumit par l'association <strong>${associationName}</strong> pour l'évènement <strong>${eventName}</strong> qui aura lieu le <strong>${format(eventDate, "dd/MM/yyy")}</strong>.</p>
            <p>Vous pouvez consulter les détails du ticket sur le <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/bagadAsso/tickets/${ticketId}">tableau de bord des tickets bagadAssos</a>.</p>
            `

export const contactEmailTemplate = (data: Contact): string => `
            <p style="text-align: center;">Vous avez reçu un nouveau message de contact.</p>
            <p style="text-align: center;"><strong>Nom:</strong> ${data.lastName}</p>
            <p style="text-align: center;"><strong>Prénom:</strong> ${data.firstName}</p>
            <p style="text-align: center;"><strong>Email:</strong> ${data.email}</p>
            <p style="text-align: center;"><strong>Message:</strong></p>
            <p style="text-align: center;">${data.message}</p>
`

export const tutorApplicationEmailTemplate = (
    data: Omit<BTPTutorApplication, "cv" | "motivationLetter">
): string => `
            <p style="text-align: center;">Une nouvelle candidature de tuteur à été reçue.</p>
            <p style="text-align: center;"><strong>Nom:</strong> ${data.lastName}</p>
            <p style="text-align: center;"><strong>Prénom:</strong> ${data.firstName}</p>
            <p style="text-align: center;"><strong>Email:</strong> ${data.email}</p>
            <p style="text-align: center;">Vous pouvez consulter les détails de cette candidature sur le <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/bouge-ta-prison">tableau de bord des candidatures tutorats du projet Bouge Ta Prison</a></p>
            `

export const tutorQuestionEmailTemplate = (
    data: BTPTutorQuestion,
    id: number
): string => `
            <p style="text-align: center;">Une nouvelle question de tutorat à été reçue.</p>
            <p style="text-align: center;"><strong>Nom:</strong> ${data.lastName}</p>
            <p style="text-align: center;"><strong>Prénom:</strong> ${data.firstName}</p>
            <p style="text-align: center;"><strong>Email:</strong> ${data.email}</p>
            <p style="text-align: center;">Vous pouvez consulter les détails de cette question sur le <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/bouge-ta-prison/questions/${id}">tableau de bord des questions tutorats du projet Bouge Ta Prison</a></p>
            `

export const tutorApplicationApprovalEmailTemplate = (
    data: BTPTutorApplicationPrisma
): string => `
            <p style="text-align: center;">Bonjour ${data.firstName} ${data.lastName},</p>
            <p style="text-align: center;">Merci pour l'intérêt que tu portes au projet, j'ai bien reçu ta candidature pour devenir tuteur pour l'année 2025-2026. Je reviens vers toi prochainement. </p>
            <br />
            <p style="text-align: center;">A bientôt, <br /> l'équipe Bouge Ta Prison</p>
            `
