"use client"

import type { BagadAssoTicket } from "@prisma/client"
import { format, isBefore } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { MdDelete } from "react-icons/md"
import deleteBagadAssoTicketAction from "@/actions/bagadAsso/deleteTicketAction"
import { useToast } from "@/components/ui/use-toast"
import LoadingRing from "../loadingRing"

export default function BagadAssoTicketCard({
    ticket
}: {
    ticket: BagadAssoTicket
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()

    const onDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()

        setIsLoading(true)

        const response = await deleteBagadAssoTicketAction(ticket.id)

        if (response.error) {
            // Toast Error
            toast({
                variant: "destructive",
                description: `${response.error}`,
                title: "Erreur"
            })
        } else {
            // Toast Success
            toast({
                variant: "default",
                description: "Le ticket a été supprimé avec succès.",
                title: "Succès"
            })
        }
        setIsLoading(false)
    }

    const isExpired = isBefore(new Date(ticket.eventDate), new Date())

    return (
        <div
            className={`flex w-full flex-col items-center justify-between rounded-lg border border-gray-300 p-4 shadow-xs transition-shadow duration-300 hover:shadow-md md:flex-row ${isExpired ? "bg-red-100" : ""}`}
        >
            <div className="flex w-full flex-col items-center md:w-auto md:flex-row">
                <span className="mb-2 hidden rounded-md bg-gray-800 px-2 py-1 font-mono text-sm text-white sm:block md:mr-4 md:mb-0">
                    #{ticket.id}
                </span>
                <Link
                    href={`/dashboard/bagadAsso/tickets/${ticket.id}`}
                    className="mb-2 text-black underline transition-colors duration-300 hover:text-gray-600 md:mr-4 md:mb-0"
                >
                    {ticket.assocation.length > 12
                        ? `${ticket.assocation.substring(0, 12)}...`
                        : ticket.assocation}
                </Link>
                <span className="mb-2 text-gray-600 md:mr-4 md:mb-0">
                    {format(ticket.creationDate, "dd/MM/yyyy")}
                </span>
                <span
                    className={`font-semibold text-sm ${isExpired ? "text-red-600" : "text-green-600"}`}
                >
                    {isExpired ? "Dépassé" : "A venir"}
                </span>
            </div>
            <button
                type="button"
                title={`Supprimer le ticket n°${ticket}`}
                onClick={onDelete}
                className="mt-2 flex flex-row items-center justify-center rounded-md bg-red-500 px-2 py-2 text-white transition-colors duration-300 hover:bg-red-600 md:mt-0"
            >
                {isLoading ? (
                    <LoadingRing className="m-0!" />
                ) : (
                    <MdDelete size="20" />
                )}
            </button>
        </div>
    )
}
