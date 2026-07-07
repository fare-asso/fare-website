import TicketList from "@/components/dashboard/bagadAsso/tickets/ticketList"
import type { BagadAssoTicket } from "@/generated/prisma/client"

export default function ActiveTickets({
    tickets
}: {
    tickets: BagadAssoTicket[]
}) {
    return (
        <div>
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold"> {tickets.length} tickets</span>{" "}
                dont la date d'événement n'est pas encore passée.
            </p>
            <TicketList tickets={tickets} />
        </div>
    )
}
