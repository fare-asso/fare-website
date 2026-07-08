import type { BagadAssoTicket } from "@/generated/prisma/client"

import TicketList from "./ticketList"

export default function ArchivedTickets({
    tickets
}: {
    tickets: BagadAssoTicket[]
}) {
    const archived = tickets
        .filter((t) => t.deleted)
        .sort(
            (a, b) =>
                new Date(b.eventDate).getTime() -
                new Date(a.eventDate).getTime()
        )

    return (
        <div>
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold"> {archived.length} tickets</span>{" "}
                archivés.
            </p>
            <TicketList tickets={archived} />
        </div>
    )
}
