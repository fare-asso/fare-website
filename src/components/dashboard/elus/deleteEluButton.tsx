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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { Elu } from "@/generated/prisma/client"

import LoadingRing from "../loadingRing"

export default function DeleteEluButton({ elu }: { elu: Elu }) {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const handleDelete = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault()

        startTransition(async () => {
            const { data, error } = await actions.elus.deleteEluAction(elu.id)
            if (error) {
                toast.error("Echec de la suppression de l'élu·e")
                return
            }
            if (!data.success) {
                toast.error(data.error)
                return
            }
            setIsOpen(false)
            toast.success("Élu·e supprimé·e.", {
                duration: 10000,
                action: {
                    label: "Annuler",
                    onClick: () => {
                        startTransition(async () => {
                            const restore = await actions.elus.restoreEluAction(
                                elu.id
                            )
                            if (restore.error) {
                                toast.error(
                                    "Echec de la restauration de l'élu·e"
                                )
                            } else if (restore.data.success) {
                                await queryClient.invalidateQueries({
                                    queryKey: ["elus"]
                                })
                            } else {
                                toast.error(restore.data.error)
                            }
                        })
                    }
                }
            })
            await queryClient.invalidateQueries({ queryKey: ["elus"] })
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
                            <Trash2Icon size={18} />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Supprimer</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Voulez-vous vraiment supprimer l'élu·e{" "}
                        <span className="font-bold">{elu.name}</span> ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Vous pourrez annuler cette action.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? <LoadingRing /> : null} Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
