import TicketList from "@/components/dashboard/bagadAsso/tickets/ticketList"
import prisma from "@/helpers/db"

export default async function ActiveTickets() {
    const now = new Date()
    const tickets = await prisma.bagadAssoTicket.findMany({
        where: {
            deleted: null,
            eventDate: {
                gte: now
            }
        },
        orderBy: {
            eventDate: "desc"
        }
    })

    return (
        <div>
            <p className="my-4 text-gray-500 text-sm">
                <span className="font-bold"> {tickets.length} tickets</span>{" "}
                dont la date d'événement n'est pas encore passée.
            </p>
            <TicketList tickets={tickets} />
        </div>
    )
}
