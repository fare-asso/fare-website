import prisma from "@/helpers/db";
import TicketList from "./ticketList";

export default async function Tickets() {
    const tickets = await prisma.bagadAssoTicket.findMany({
        orderBy: {
            creationDate: "desc",
        },
    });
    return <TicketList tickets={tickets} />;
}
