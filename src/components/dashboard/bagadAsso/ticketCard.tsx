"use client";

import deleteBagadAssoTicketAction from "@/actions/bagadAsso/deleteTicketAction";
import { BagadAssoTicket } from "@prisma/client";
import { format, isBefore } from "date-fns";
import Link from "next/link";
import { MdDelete } from "react-icons/md";
import LoadingRing from "../loadingRing";
import { useState } from "react";
import { ToastActionElement, ToastProps } from "@/components/ui/toast";

type ToasterToast = ToastProps & {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastActionElement;
};

type Toast = Omit<ToasterToast, "id">;

export default function BagadAssoTicketCard({
    ticket,
    toast,
}: {
    ticket: BagadAssoTicket;
    toast: ({ ...props }: Toast) => {
        id: string;
        dismiss: () => void;
        update: (props: ToasterToast) => void;
    };
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        setIsLoading(true);

        const response = await deleteBagadAssoTicketAction(ticket.id);

        if (response.error) {
            // Toast Error
            toast({
                variant: "destructive",
                description: `${response.error}`,
                title: "Erreur",
            });
        } else {
            // Toast Success
            toast({
                variant: "default",
                description: "Le ticket a été supprimé avec succès.",
                title: "Succès",
            });
        }
        setIsLoading(false);
    };

    const isExpired = isBefore(new Date(ticket.eventDate), new Date());

    return (
        <div
            className={`w-full border border-gray-300 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-300 ${isExpired ? "bg-red-100" : ""}`}
        >
            <div className="flex flex-col md:flex-row items-center w-full md:w-auto">
                <span className="hidden sm:block bg-gray-800 text-sm px-2 py-1 rounded-md text-white font-mono mb-2 md:mb-0 md:mr-4">
                    #{ticket.id}
                </span>
                <Link
                    href={`/dashboard/bagadAsso/tickets/${ticket.id}`}
                    className="underline text-black hover:text-gray-600 transition-colors duration-300 mb-2 md:mb-0 md:mr-4"
                >
                    {ticket.assocation.length > 12
                        ? `${ticket.assocation.substring(0, 12)}...`
                        : ticket.assocation}
                </Link>
                <span className="text-gray-600 mb-2 md:mb-0 md:mr-4">
                    {format(ticket.creationDate, "dd/MM/yyyy")}
                </span>
                <span
                    className={`text-sm font-semibold ${isExpired ? "text-red-600" : "text-green-600"}`}
                >
                    {isExpired ? "Dépassé" : "A venir"}
                </span>
            </div>
            <button
                title={`Supprimer le ticket n°${ticket}`}
                onClick={onDelete}
                className="flex flex-row  items-center justify-center bg-red-500 text-white px-2 py-2 rounded-md hover:bg-red-600 transition-colors duration-300 mt-2 md:mt-0"
            >
                {isLoading ? (
                    <LoadingRing className="!m-0" />
                ) : (
                    <MdDelete size="20" />
                )}
            </button>
        </div>
    );
}
