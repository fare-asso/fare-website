import { Contact } from "@/schemas/contact";
import { format } from "date-fns";

export const adhesionEmailTemplate = (associationName: string): string => `
            <p>Une nouvelle adhésion a été reçue pour l'association <strong>${associationName}</strong>.</p>
            <p>Vous pouvez consulter les détails de cette adhésion dans le <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/adhesions">tableau de bord des adhésions</a>.</p>
            `;

export const bagadAssoTicketEmailTemplate = (
    ticketId: number,
    associationName: string,
    eventDate: Date,
    eventName: string,
): string => `
            <p>Un nouveau ticket Bagad'Asso à été soumit par l'association <strong>${associationName}</strong> pour l'évènement <strong>${eventName}</strong> qui aura lieu le <strong>${format(eventDate, "dd/MM/yyy")}</strong>.</p>
            <p>Vous pouvez consulter les détails du ticket sur le <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/bagadAsso/tickets/${ticketId}">tableau de bord des tickets bagadAssos</a>.</p>
            `;

export const contactEmailTemplate = (data: Contact): string => `
            <p style="text-align: center;">Vous avez reçu un nouveau message de contact.</p>
            <p style="text-align: center;"><strong>Nom:</strong> ${data.lastName}</p>
            <p style="text-align: center;"><strong>Prénom:</strong> ${data.firstName}</p>
            <p style="text-align: center;"><strong>Email:</strong> ${data.email}</p>
            <p style="text-align: center;"><strong>Message:</strong></p>
            <p style="text-align: center;">${data.message}</p>
`;
