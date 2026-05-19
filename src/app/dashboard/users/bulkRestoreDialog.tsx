"use client"

import { useState, useTransition } from "react"

import bulkRestoreUsers from "@/actions/users/bulkRestoreUsers"
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

export function BulkRestoreDialog({
    userIds,
    open,
    onOpenChange,
    onSuccess
}: Props) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleRestore = () => {
        setError(null)
        startTransition(async () => {
            const result = await bulkRestoreUsers(userIds)
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
                        Restaurer {userIds.length} utilisateur
                        {userIds.length > 1 ? "s" : ""} ?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>
                                Vous etes sur le point de restaurer{" "}
                                <strong>{userIds.length}</strong> utilisateur
                                {userIds.length > 1 ? "s" : ""}.
                            </p>
                            <p className="rounded-md bg-emerald-100 p-3 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                                Les utilisateurs pourront a nouveau se connecter
                                et acceder a leur compte.
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
                            handleRestore()
                        }}
                        disabled={isPending}
                    >
                        {isPending && <LoadingRing />}
                        Restaurer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
