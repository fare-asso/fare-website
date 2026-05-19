"use client"

import { useState, useTransition } from "react"

import bulkDeleteUsers from "@/actions/users/bulkDeleteUsers"
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
    const [error, setError] = useState<string | null>(null)

    const handleDelete = () => {
        setError(null)
        startTransition(async () => {
            const result = await bulkDeleteUsers(userIds)
            if (result.success) {
                onOpenChange(false)
                onSuccess()
            } else {
                setError(result.error || "Une erreur s'est produite")
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
                            {error && (
                                <p className="rounded-md bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                    {error}
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
