"use client"

import type { BagadAssoTicket } from "@prisma/client"
import { TicketIcon } from "lucide-react"
import BagadAssoTicketCard from "./ticketCard"

export default function TicketList({
    tickets
}: {
    tickets: BagadAssoTicket[]
}) {
    return (
        <div className="@container flex h-full flex-col">
            <div className="flex-1 overflow-y-auto">
                {tickets.length > 0 ? (
                    <div className="grid @min-2xl:grid-cols-2 grid-cols-1 gap-4">
                        {tickets.map((ticket) => (
                            <BagadAssoTicketCard
                                key={ticket.id}
                                ticket={ticket}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30">
                        <TicketIcon className="mb-3 h-12 w-12 text-muted-foreground/50" />
                        <p className="font-medium text-muted-foreground">
                            Aucun ticket pour le moment
                        </p>
                        <p className="mt-1 text-muted-foreground/70 text-sm">
                            Les tickets créés apparaîtront ici
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
