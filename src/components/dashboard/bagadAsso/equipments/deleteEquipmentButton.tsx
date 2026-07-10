import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { Trash2Icon } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

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
    const [open, setOpen] = useState(false)
    const [isPending, submit] = useTransition()
    const queryClient = useQueryClient()

    const handleDelete = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault()

        submit(async () => {
            const { data, error } =
                await actions.bagadAsso.deleteEquipmentAction(equipmentId)
            if (error || !data.success) {
                toast.error(
                    data && !data.success
                        ? data.error
                        : "Une erreur est survenue. Veuillez réessayer."
                )
                return
            }
            setOpen(false)
            toast.success("L'équipement a été supprimé.")
            await queryClient.invalidateQueries({
                queryKey: ["bagadEquipments"]
            })
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
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
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? <LoadingRing className="m-0!" /> : null}{" "}
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
