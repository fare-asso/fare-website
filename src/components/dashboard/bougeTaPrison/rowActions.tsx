import { useRouter } from "@tanstack/react-router"
import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { archiveTutorApplicationAction } from "@/actions/bouge-ta-prison/archiveTutorApplication"
import { unarchiveTutorApplicationAction } from "@/actions/bouge-ta-prison/unarchiveTutorApplication"
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { BTPTutorApplication } from "@/generated/prisma/client"

export default function RowActions({
    application
}: {
    application: BTPTutorApplication
}) {
    const [isLoading, setIsLoading] = useState(false)
    const isArchived = application.archived !== null
    const router = useRouter()

    const onArchive = async () => {
        setIsLoading(true)
        const response = await archiveTutorApplicationAction({
            data: { id: application.id }
        })
        if (response.success) {
            await router.invalidate()
            toast.success("La candidature a été archivée.")
        } else {
            toast.error(response.error)
        }
        setIsLoading(false)
    }

    const onUnarchive = async () => {
        setIsLoading(true)
        const response = await unarchiveTutorApplicationAction({
            data: { id: application.id }
        })
        if (response.success) {
            await router.invalidate()
            toast.success("La candidature a été désarchivée.")
        } else {
            toast.error(response.error)
        }
        setIsLoading(false)
    }

    return (
        <AlertDialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className={`shrink-0 ${
                                isArchived
                                    ? "text-primary hover:bg-primary/10 hover:text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <LoadingRing className="m-0!" />
                            ) : isArchived ? (
                                <ArchiveRestoreIcon className="h-4 w-4" />
                            ) : (
                                <ArchiveIcon className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                                {isArchived ? "Désarchiver" : "Archiver"}
                            </span>
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    {isArchived ? "Désarchiver" : "Archiver"}
                </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isArchived
                            ? "Désarchiver la candidature ?"
                            : "Archiver la candidature ?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div>
                            {isArchived ? (
                                <p>
                                    La candidature de {application.firstName}{" "}
                                    {application.lastName} sera restaurée et
                                    réapparaîtra dans la liste des candidatures
                                    actives.
                                </p>
                            ) : (
                                <>
                                    <p>
                                        La candidature de{" "}
                                        {application.firstName}{" "}
                                        {application.lastName} sera archivée et
                                        masquée de la liste.
                                    </p>
                                    <p className="mt-1">
                                        Elle pourra être restaurée si besoin.
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
    )
}
