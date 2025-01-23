export const adhesionEmailTemplate = (associationName: string): string => `
            <p>Une nouvelle adhésion a été reçue pour l'association <strong>${associationName}</strong>.</p>
            <p>Vous pouvez consulter les détails de cette adhésion dans le <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/adhesions">tableau de bord des adhésions</a>.</p>
            `;

export const bagadAssoTicketEmailTemplate = (
    ticketId: number,
    associationName: string,
): string => `
            <p>Un nouveau tilcet bagad'Asso à été soumit par l'association <strong>${associationName}</strong>.</p>
            <p>Vous pouvez consulter les détails du ticket sur le <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/adhesions">tableau de bord des tickets bagadAssos</a>.</p>
            `;
