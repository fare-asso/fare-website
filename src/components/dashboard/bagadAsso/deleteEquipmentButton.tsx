"use client"

import { startTransition, useActionState, useEffect } from "react"
import { MdDelete } from "react-icons/md"
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
import LoadingRing from "../loadingRing"

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
                <Button className="aspect-square p-2" variant="destructive">
                    <MdDelete size={20} />
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
