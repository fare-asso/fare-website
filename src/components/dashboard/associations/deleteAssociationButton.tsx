"use client"

import type { Association } from "@prisma/client"
import { Trash2Icon } from "lucide-react"
import { startTransition, useActionState, useEffect, useState } from "react"
import deleteAssociationAction from "@/actions/associations/deleteAssociationAction"
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

export default function DeleteAssociationButton({
    association
}: {
    association: Association
}) {
    const [formState, formAction] = useActionState<
        { error?: string; success?: boolean } | undefined,
        number
    >(deleteAssociationAction, undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState?.success) {
            setIsLoading(false)
            setIsOpen(false)
        }

        setIsLoading(false)
    }, [formState])

    const handleDelete = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
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
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2Icon size={18} />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Supprimer</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Voulez-vous vraiment supprimer l'association{" "}
                        <span className="font-bold">{association.name}</span> ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est permanente et les données de
                        l'association ne peuvent être récupérées. Le
                        représentant de l'association perdra ses accès à
                        l'espace association.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                        {isLoading ? <LoadingRing /> : null} Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
