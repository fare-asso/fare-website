"use client";

import { Card } from "@/components/ui/card";
import { BagadAssoTicket } from "@prisma/client";
import BagadAssoTicketCard from "./ticketCard";
import { useToast } from "@/components/ui/use-toast";

export default function TicketList({
    tickets,
}: {
    tickets: BagadAssoTicket[];
}) {
    const { toast } = useToast();

    return (
        <Card className="flex h-full w-full flex-col space-y-2 p-4">
            {tickets.map((ticket) => (
                <BagadAssoTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    toast={toast}
                />
            ))}
        </Card>
    );
}
