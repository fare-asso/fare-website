import { useRouter } from "@tanstack/react-router"
import { Trash2Icon } from "lucide-react"
import { startTransition, useEffect, useState } from "react"
import { toast } from "sonner"

import { deleteConseilAction } from "@/actions/conseils/deleteConseilAction"
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
import type { Conseil } from "@/generated/prisma/client"

import LoadingRing from "../loadingRing"

export default function DeleteConseilButton({ conseil }: { conseil: Conseil }) {
    const router = useRouter()
    const [formState, setFormState] = useState<
        { success: true } | { success: false; error: string } | undefined
    >(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    // Fermer le dialogue lorsque l'action du formulaire indique un succès
    useEffect(() => {
        if (formState === undefined) return
        setIsLoading(false)
        if (formState.success) {
            setIsOpen(false)
        } else {
            toast.error(formState.error)
        }
    }, [formState])

    const handleOpenChange = (open: boolean) => {
        if (!open) setIsLoading(false)
        setIsOpen(open)
    }

    const handleDelete = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault()

        setIsLoading(true)

        startTransition(async () => {
            const result = await deleteConseilAction({ data: conseil.id })
            if (result?.success) {
                await router.invalidate()
            }
            setFormState(result)
        })
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
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
                        Voulez-vous vraiment supprimer le conseil{" "}
                        <span className="font-bold">{conseil.name}</span> ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est permanente. Vous devez d'abord
                        supprimer tous les éluEs de ce conseil avant de pouvoir
                        le supprimer.
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
