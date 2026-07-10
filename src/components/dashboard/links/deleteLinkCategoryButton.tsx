import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { Trash2Icon } from "lucide-react"
import type { MouseEvent } from "react"
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
import type { LinkCategory } from "@/generated/prisma/client"

import LoadingRing from "../loadingRing"

export default function DeleteLinkCategoryButton({
    category
}: {
    category: LinkCategory
}) {
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()

    const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()

        startTransition(async () => {
            const { data, error } =
                await actions.links.deleteLinkCategoryAction(category.id)
            if (error) {
                toast.error("Une erreur est survenue. Veuillez réessayer.")
            } else if (data.success) {
                setIsOpen(false)
                await queryClient.invalidateQueries({ queryKey: ["links"] })
            } else {
                toast.error(data.error)
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
                        {isPending ? <LoadingRing /> : null} Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
