import TicketList from "@/components/dashboard/bagadAsso/tickets/ticketList"
import prisma from "@/helpers/db"

export default async function ArchivedTickets() {
    const tickets = await prisma.bagadAssoTicket.findMany({
        where: {
            deleted: {
                not: null
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
                archivés.
            </p>
            <TicketList tickets={tickets} />
        </div>
    )
}
