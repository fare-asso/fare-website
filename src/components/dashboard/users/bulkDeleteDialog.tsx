import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { useState, useTransition } from "react"

import LoadingRing from "@/components/dashboard/loadingRing"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"

type Props = {
    userIds: string[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function BulkDeleteDialog({
    userIds,
    open,
    onOpenChange,
    onSuccess
}: Props) {
    const [isPending, startTransition] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const handleDelete = () => {
        setSubmitError(null)
        startTransition(async () => {
            const { data, error } = await actions.users.bulkDeleteUsers(userIds)
            if (error) {
                setSubmitError("Une erreur est survenue. Veuillez réessayer.")
            } else if (data.success) {
                onOpenChange(false)
                onSuccess()
                await queryClient.invalidateQueries({ queryKey: ["users"] })
            } else {
                setSubmitError(data.error || "Une erreur s'est produite")
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Supprimer {userIds.length} utilisateur
                        {userIds.length > 1 ? "s" : ""} ?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>
                                Vous etes sur le point de supprimer{" "}
                                <strong>{userIds.length}</strong> utilisateur
                                {userIds.length > 1 ? "s" : ""}.
                            </p>
                            <p className="rounded-md bg-amber-100 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                Les utilisateurs seront archives et ne pourront
                                plus se connecter. Cette action peut etre
                                annulee par un administrateur.
                            </p>
                            {submitError && (
                                <p className="rounded-md bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                    {submitError}
                                </p>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending && <LoadingRing />}
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
