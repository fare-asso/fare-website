"use client"

import { Trash2Icon } from "lucide-react"
import { startTransition, useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

import deleteLinkAction from "@/actions/links/deleteLinkAction"
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
import type { LinkItem } from "@/generated/prisma/client"

import LoadingRing from "../loadingRing"

function isPdf(url: string): boolean {
    return /\.pdf(\?|#|$)/i.test(url)
}

export default function DeleteLinkButton({ link }: { link: LinkItem }) {
    const [formState, formAction] = useActionState<
        { success: true } | { success: false; error: string } | undefined,
        number
    >(deleteLinkAction, undefined)
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

        startTransition(() => {
            formAction(link.id)
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
                        Voulez-vous vraiment supprimer le lien{" "}
                        <span className="font-bold">{link.label}</span> ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est permanente.
                        {isPdf(link.url) &&
                            " Le document ne sera pas supprimé, uniquement le lien."}
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
