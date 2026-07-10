import type { BagadAssoTicket } from "@/generated/prisma/client"

import TicketList from "./ticketList"

export default function PastTickets({
    tickets
}: {
    tickets: BagadAssoTicket[]
}) {
    const now = new Date()
    const past = tickets
        .filter((t) => !t.deleted && new Date(t.eventDate) < now)
        .sort(
            (a, b) =>
                new Date(b.eventDate).getTime() -
                new Date(a.eventDate).getTime()
        )

    return (
        <div>
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold"> {past.length} tickets</span> dont
                la date d'événement est déjà passée.
            </p>
            <TicketList tickets={past} />
        </div>
    )
}
