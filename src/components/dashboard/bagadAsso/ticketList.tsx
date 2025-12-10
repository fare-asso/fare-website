"use client"

import type { BagadAssoTicket } from "@prisma/client"
import BagadAssoTicketCard from "./ticketCard"

export default function TicketList({
    tickets
}: {
    tickets: BagadAssoTicket[]
}) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto rounded-lg border p-4 shadow-xs">
                <div className="flex h-auto flex-col gap-2">
                    {tickets.length > 0 ? (
                        tickets.map((ticket) => (
                            <BagadAssoTicketCard
                                key={ticket.id}
                                ticket={ticket}
                            />
                        ))
                    ) : (
                        <span className="text-sm opacity-50">
                            Il n'y a pas encore de tickets.😔
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
