import { actions } from "astro:actions"
import { ArchiveIcon, ArchiveRestoreIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

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

export default function QuestionActions({
    questionId,
    questionAuthor,
    isArchived
}: {
    questionId: number
    questionAuthor: string
    isArchived: boolean
}) {
    const [isArchiveLoading, setIsArchiveLoading] = useState(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    const onArchive = async () => {
        setIsArchiveLoading(true)

        const { data, error } =
            await actions.bougeTaPrison.archiveTutorQuestion(questionId)

        if (error) {
            toast.error("Une erreur est survenue. Veuillez réessayer.")
        } else if (data.success) {
            toast.success("La question a été archivée.")
            window.location.reload()
        } else {
            toast.error(data.error)
        }
        setIsArchiveLoading(false)
    }

    const onUnarchive = async () => {
        setIsArchiveLoading(true)

        const { data, error } =
            await actions.bougeTaPrison.unarchiveTutorQuestion(questionId)

        if (error) {
            toast.error("Une erreur est survenue. Veuillez réessayer.")
        } else if (data.success) {
            toast.success("La question a été désarchivée.")
            window.location.reload()
        } else {
            toast.error(data.error)
        }
        setIsArchiveLoading(false)
    }

    const onHardDelete = async () => {
        setIsDeleteLoading(true)

        const { data, error } =
            await actions.bougeTaPrison.deleteTutorQuestion(questionId)

        if (error) {
            toast.error("Une erreur est survenue. Veuillez réessayer.")
            setIsDeleteLoading(false)
        } else if (data.success) {
            toast.success("La question a été supprimée définitivement.")
            window.location.href = "/dashboard/bouge-ta-prison/questions"
        } else {
            toast.error(data.error)
            setIsDeleteLoading(false)
        }
    }

    return (
        <div className="border-muted-foreground/30 flex flex-col gap-3 rounded-lg border border-dashed p-4">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Actions sur la question
            </p>
            <div className="flex flex-wrap gap-2">
                {/* Archive / Unarchive Button */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isArchiveLoading}
                            className="gap-2"
                        >
                            {isArchiveLoading ? (
                                <LoadingRing className="m-0!" />
                            ) : isArchived ? (
                                <ArchiveRestoreIcon className="h-4 w-4" />
                            ) : (
                                <ArchiveIcon className="h-4 w-4" />
                            )}
                            {isArchived ? "Désarchiver" : "Archiver"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isArchived
                                    ? "Désarchiver la question ?"
                                    : "Archiver la question ?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div>
                                    {isArchived ? (
                                        <p>
                                            La question #{questionId} de "
                                            {questionAuthor}" sera restaurée et
                                            réapparaîtra dans la liste des
                                            questions actives.
                                        </p>
                                    ) : (
                                        <>
                                            <p>
                                                La question #{questionId} de "
                                                {questionAuthor}" sera marquée
                                                comme traitée et masquée de la
                                                liste.
                                            </p>
                                            <p className="mt-1">
                                                Elle pourra être restaurée si
                                                besoin.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={isArchived ? onUnarchive : onArchive}
                            >
                                {isArchived ? "Désarchiver" : "Archiver"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Hard Delete Button */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isDeleteLoading}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                        >
                            {isDeleteLoading ? (
                                <LoadingRing className="m-0!" />
                            ) : (
                                <Trash2Icon className="h-4 w-4" />
                            )}
                            Supprimer définitivement
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Supprimer définitivement la question ?
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-2">
                                    <p>
                                        La question #{questionId} de "
                                        {questionAuthor}" sera{" "}
                                        <span className="text-destructive font-semibold">
                                            supprimée de manière permanente
                                        </span>
                                        .
                                    </p>
                                    <p>
                                        Cette action est irréversible et toutes
                                        les données associées seront perdues.
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Utilisez cette option uniquement pour
                                        les doublons ou les questions créées par
                                        erreur.
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={onHardDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Supprimer définitivement
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
