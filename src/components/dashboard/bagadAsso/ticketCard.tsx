import { BagadAssoTicket } from "@prisma/client";
import { format } from "date-fns";

export default function BagadAssoTicketCard({ticket} : {ticket: BagadAssoTicket}) {
    return (
        <div className="w-full border border-foreground rounded-lg p-4 flex flex-row items-center justify-between">
            
            <span className="bg-black text-sm px-1 rounded-md text-white" style={{fontFamily: "Consolas, serif"}}>#{ticket.id}</span>
            <span>{ticket.assocation}</span>
            <span>{format(ticket.creationDate, 'dd/MM/yyyy') }</span>
        </div>
    )
}