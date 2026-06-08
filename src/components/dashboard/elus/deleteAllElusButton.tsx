"use client"

import { EraserIcon } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import bulkDeleteElusAction from "@/actions/elus/bulkDeleteElusAction"
import bulkRestoreElusAction from "@/actions/elus/bulkRestoreElusAction"
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

export default function DeleteAllElusButton({
    conseilName,
    eluIds
}: {
    conseilName: string
    eluIds: number[]
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleDelete = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault()
        startTransition(async () => {
            const res = await bulkDeleteElusAction(eluIds)
            if (res.success) {
                toast.success(`${res.value.count} éluEs suppriméEs.`, {
                    duration: 10000,
                    action: {
                        label: "Annuler",
                        onClick: () => {
                            startTransition(async () => {
                                const restore =
                                    await bulkRestoreElusAction(eluIds)
                                if (!restore.success) {
                                    toast.error(restore.error)
                                }
                            })
                        }
                    }
                })
                setIsOpen(false)
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
                            <EraserIcon size={18} />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Vider le conseil</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Vider le conseil{" "}
                        <span className="font-bold">{conseilName}</span> ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action supprimera les {eluIds.length} éluE
                        {eluIds.length > 1 ? "s" : ""} de ce conseil. Vous
                        pourrez annuler cette action.
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
                        {isPending ? <LoadingRing /> : null} Tout supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
