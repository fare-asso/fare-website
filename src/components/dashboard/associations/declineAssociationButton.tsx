"use client"

import type { Association } from "@prisma/client"
import { XCircleIcon } from "lucide-react"
import { startTransition, useActionState, useEffect, useState } from "react"

import declineAssociationAction from "@/actions/associations/declineAssociationAction"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

import LoadingRing from "../loadingRing"

export default function DeclineAssociationButton({
    association
}: {
    association: Association
}): React.JSX.Element {
    const [formState, formAction] = useActionState<
        { error?: string; success?: boolean } | undefined,
        number
    >(declineAssociationAction, undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    useEffect(() => {
        if (formState?.success) {
            setIsLoading(false)
            setIsOpen(false)
        }

        setIsLoading(false)
    }, [formState])

    const handleDecline = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        event.preventDefault()
        setIsLoading(true)
        startTransition(() => {
            formAction(association.id)
        })
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        >
                            <XCircleIcon size={18} />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Refuser</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Refuser l'association{" "}
                        <span className="font-bold">{association.name}</span> ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        L'association sera supprimee ainsi que son logo. La
                        demande d'adhesion restera disponible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDecline}
                        className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                        {isLoading ? <LoadingRing /> : null} Refuser
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
