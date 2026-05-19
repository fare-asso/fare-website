"use client"

import { Trash2Icon } from "lucide-react"
import { startTransition, useActionState, useEffect } from "react"

import deleteEquipmentAction from "@/actions/bagadAsso/deleteEquipmentAction"
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

import LoadingRing from "../../loadingRing"

export default function DeleteEquipmentButton({
    equipmentId
}: {
    equipmentId: number
}) {
    const [formState, formAction, pending] = useActionState<
        { error?: string; success?: boolean } | undefined,
        number
    >(deleteEquipmentAction, undefined)

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState?.success) {
            // Dialog closes automatically via AlertDialog
        }
    }, [formState])

    const handleDelete = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault()

        startTransition(() => {
            formAction(equipmentId)
        })
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                >
                    <Trash2Icon className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Voulez-vous vraiment supprimer cet équipement ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est permanente et les données ne peuvent
                        être récupérées.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                        {pending ? <LoadingRing /> : null} Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
