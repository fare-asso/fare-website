import type { BagadAssoTicket } from "@/generated/prisma/client"

import TicketList from "./ticketList"

export default function ValidatedTickets({
    tickets
}: {
    tickets: BagadAssoTicket[]
}) {
    const validated = tickets
        .filter((t) => !t.deleted && t.validated)
        .sort(
            (a, b) =>
                new Date(a.eventDate).getTime() -
                new Date(b.eventDate).getTime()
        )

    return (
        <div>
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold"> {validated.length} tickets</span>{" "}
                validés par l'équipe.
            </p>
            <TicketList tickets={validated} />
        </div>
    )
}
