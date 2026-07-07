import { useRouter } from "@tanstack/react-router"
import { Trash2Icon } from "lucide-react"
import { startTransition, useEffect, useState } from "react"
import { toast } from "sonner"

import { deleteLinkCategoryAction } from "@/actions/links/deleteLinkCategoryAction"
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
import type { LinkCategory } from "@/generated/prisma/client"

import LoadingRing from "../loadingRing"

export default function DeleteLinkCategoryButton({
    category
}: {
    category: LinkCategory
}) {
    const router = useRouter()
    const [formState, setFormState] = useState<
        { success: true } | { success: false; error: string } | undefined
    >(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

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
            const result = await deleteLinkCategoryAction({
                data: category.id
            })
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
                        Voulez-vous vraiment supprimer la catégorie{" "}
                        <span className="font-bold">{category.name}</span> ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est permanente. Tous les liens de cette
                        catégorie seront également supprimés.
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
