import { useRouter } from "@tanstack/react-router"
import { CheckCircleIcon } from "lucide-react"
import { useState, useTransition } from "react"

import { approveAssociationAction } from "@/actions/associations/approveAssociationAction"
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

export default function ApproveAssociationButton({
    association
}: {
    association: Association
}): React.JSX.Element {
    const router = useRouter()
    const [isLoading, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const handleApprove = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        event.preventDefault()
        startTransition(async () => {
            const result = await approveAssociationAction({
                data: association.id
            })
            if (result?.success) {
                await router.invalidate()
                setIsOpen(false)
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
                            className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700 dark:text-green-500 dark:hover:bg-green-950 dark:hover:text-green-400"
                        >
                            <CheckCircleIcon size={18} />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Approuver</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Approuver l'association{" "}
                        <span className="font-bold">{association.name}</span> ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        L'association sera visible publiquement sur le site. La
                        demande d'adhesion liee sera automatiquement archivee.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApprove}>
                        {isLoading ? <LoadingRing /> : null} Approuver
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
