import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { XCircleIcon } from "lucide-react"
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
import type { Association } from "@/generated/prisma/client"

import LoadingRing from "../loadingRing"

export default function DeclineAssociationButton({
    association
}: {
    association: Association
}): React.JSX.Element {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const handleDecline = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        event.preventDefault()
        startTransition(async () => {
            const { data, error } =
                await actions.associations.declineAssociationAction(
                    association.id
                )
            if (error || data?.error) {
                toast.error(data?.error ?? "Échec du refus")
            } else {
                setIsOpen(false)
                toast.success(`L'association ${association.name} est refusée`)
            }
            await queryClient.invalidateQueries({
                queryKey: ["associations"]
            })
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
                        {isPending ? <LoadingRing /> : null} Refuser
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
