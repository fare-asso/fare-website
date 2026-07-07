"use client"

import { Trash2Icon } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import deleteEluAction from "@/actions/elus/deleteEluAction"
import restoreEluAction from "@/actions/elus/restoreEluAction"
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

    const handleDelete = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault()

        startTransition(async () => {
            const res = await deleteEluAction(elu.id)
            if (res.success) {
                setIsOpen(false)
                toast.success("Élu·e supprimé·e.", {
                    duration: 10000,
                    action: {
                        label: "Annuler",
                        onClick: () => {
                            startTransition(async () => {
                                const restore = await restoreEluAction(elu.id)
                                if (!restore.success) {
                                    toast.error(restore.error)
                                }
                            })
                        }
                    }
                })
            } else {
                toast.error(res.error)
            }
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
