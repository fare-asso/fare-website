import TicketList from "@/components/dashboard/bagadAsso/tickets/ticketList"
import prisma from "@/helpers/db"

export default async function PastTickets() {
    const now = new Date()
    const tickets = await prisma.bagadAssoTicket.findMany({
        where: {
            deleted: null,
            eventDate: {
                lt: now
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
                dont la date d'événement est déjà passée.
            </p>
            <TicketList tickets={tickets} />
        </div>
    )
}
