import { useRouter } from "@tanstack/react-router"
import { Trash2 } from "lucide-react"
import { useState, useTransition } from "react"

import deleteUser from "@/actions/users/deleteUser"
import LoadingRing from "@/components/dashboard/loadingRing"
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

type Props = {
    userId: string
    userName: string | null
}

export function DeleteUserButton({ userId, userName }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        setError(null)
        startTransition(async () => {
            const result = await deleteUser(userId)
            if (result.success) {
                await router.invalidate()
                setOpen(false)
                await router.navigate({ to: "/dashboard/users" })
            } else {
                setError(result.error || "Une erreur s'est produite")
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Supprimer l'utilisateur
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Supprimer cet utilisateur ?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>
                                Vous etes sur le point de supprimer
                                l'utilisateur{" "}
                                <strong>{userName || "sans nom"}</strong>.
                            </p>
                            <p className="rounded-md bg-amber-100 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                L'utilisateur sera archive et ne pourra plus se
                                connecter. Cette action peut etre annulee par un
                                administrateur.
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
