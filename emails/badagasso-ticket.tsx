import { Heading, Link, Text } from "@react-email/components"
import { format } from "date-fns"
//biome-ignore lint/correctness/noUnusedImports: need to import react for react-email to work
import React from "react"
import BaseTemplate, { APP_URL } from "./base"

interface NewBagadAssoTicketProps {
    ticketId: number
    associationName: string
    eventDate: Date
    eventName: string
}

export function NewBagadAssoTicket({
    ticketId,
    associationName,
    eventDate,
    eventName
}: NewBagadAssoTicketProps) {
    return (
        <BaseTemplate>
            <Heading className="font-normal text-4xl text-stone-800">
                Nouveau ticket Bagad'Asso
            </Heading>
            <Text>
                Un nouveau ticket Bagad'Asso à été soumit par l'association{" "}
                <strong>{associationName}</strong> pour l'évènement{" "}
                <strong>{eventName}</strong> qui aura lieu le{" "}
                <strong>{format(eventDate, "dd/MM/yyyy")}</strong>.
            </Text>
            <Text>
                Consulte le détail du ticket dans le{" "}
                <Link
                    href={`${APP_URL}/dashboard/bagadAsso/tickets/${ticketId}`}
                    className="underline"
                >
                    tableau de bord Bagad'Asso
                </Link>{" "}
                !
            </Text>
        </BaseTemplate>
    )
}

NewBagadAssoTicket.PreviewProps = {
    associationName: "BDE test",
    eventDate: new Date(),
    eventName: "Test Event",
    ticketId: 12345
} as NewBagadAssoTicketProps

export default NewBagadAssoTicket
