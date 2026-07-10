import { actions } from "astro:actions"
import { RotateCcw } from "lucide-react"
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
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type Props = {
    userId: string
    userName: string | null
}

export function RestoreUserButton({ userId, userName }: Props) {
    const [isPending, startTransition] = useTransition()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    const handleRestore = () => {
        setSubmitError(null)
        startTransition(async () => {
            const { data, error } = await actions.users.restoreUser(userId)
            if (error) {
                setSubmitError("Une erreur est survenue. Veuillez réessayer.")
            } else if (data.success) {
                setOpen(false)
                window.location.reload()
            } else {
                setSubmitError(data.error || "Une erreur s'est produite")
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Restaurer l'utilisateur
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Restaurer cet utilisateur ?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>
                                Vous etes sur le point de restaurer
                                l'utilisateur{" "}
                                <strong>{userName || "sans nom"}</strong>.
                            </p>
                            <p className="rounded-md bg-emerald-100 p-3 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                                L'utilisateur pourra a nouveau se connecter et
                                acceder a son compte.
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
