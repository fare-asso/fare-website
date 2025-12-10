import prisma from "@/helpers/db"
import TicketList from "./ticketList"

export default async function Tickets() {
    const tickets = await prisma.bagadAssoTicket.findMany({
        where: {
            deleted: null
        }
    })

    const now = new Date()

    const sortedTickets = tickets.sort((a, b) => {
        const aIsFuture = a.eventDate >= now
        const bIsFuture = b.eventDate >= now

        // Future events come first
        if (aIsFuture && !bIsFuture) return -1
        if (!aIsFuture && bIsFuture) return 1

        // Both future: sort by eventDate ascending (soonest first)
        if (aIsFuture && bIsFuture) {
            return a.eventDate.getTime() - b.eventDate.getTime()
        }

        // Both past: sort by eventDate descending (most recent first)
        return b.eventDate.getTime() - a.eventDate.getTime()
    })

    return <TicketList tickets={sortedTickets} />
}
