"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    ArchiveIcon,
    ArchiveRestoreIcon,
    CalendarIcon,
    GraduationCapIcon,
    MailIcon
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import archiveTutorApplication from "@/actions/bouge-ta-prison/archiveTutorApplication"
import unarchiveTutorApplication from "@/actions/bouge-ta-prison/unarchiveTutorApplication"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { BTPTutorApplication } from "@/generated/prisma/client"

export default function ApplicationCard({
    application
}: {
    application: BTPTutorApplication
}) {
    const [isLoading, setIsLoading] = useState(false)

    const isArchived = application.archived !== null

    const onArchive = async () => {
        setIsLoading(true)
        const response = await archiveTutorApplication(application.id)

        if (response.error) {
            toast.error(response.error)
        } else {
            toast.success("La candidature a été archivée.")
        }
        setIsLoading(false)
    }

    const onUnarchive = async () => {
        setIsLoading(true)
        const response = await unarchiveTutorApplication(application.id)

        if (response.error) {
            toast.error(response.error)
        } else {
            toast.success("La candidature a été désarchivée.")
        }
        setIsLoading(false)
    }

    const getStatusBadge = () => {
        if (isArchived) {
            return (
                <Badge variant="outline" className="text-muted-foreground">
                    Archivée
                </Badge>
            )
        }
        if (application.approved) {
            return (
                <Badge
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                >
                    Approuvée
                </Badge>
            )
        }
        return <Badge variant="secondary">En attente</Badge>
    }

    return (
        <div
            className={`flex flex-col gap-3 rounded-lg border p-4 transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
                isArchived
                    ? "border-muted bg-muted/30 opacity-75"
                    : "border-border"
            }`}
        >
            {/* Left: Main info */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-4">
                    {getStatusBadge()}
                    <span className="text-muted-foreground text-xs">
                        #{application.id}
                    </span>
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {format(application.createdAt, "d MMM yyyy", {
                                locale: fr
                            })}
                        </span>
                    </div>
                </div>

                <Link
                    href={`/dashboard/bouge-ta-prison/candidatures-tutorat/${application.id}`}
                    className="hover:text-primary text-base font-semibold transition-colors hover:underline"
                >
                    {application.firstName} {application.lastName}
                </Link>

                <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <div className="flex items-center gap-1.5">
                        <MailIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{application.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <GraduationCapIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {application.major} — {application.studyYear}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex shrink-0 items-center gap-2">
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
                                        {isArchived
                                            ? "Désarchiver"
                                            : "Archiver"}
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
                                            La candidature de{" "}
                                            {application.firstName}{" "}
                                            {application.lastName} sera
                                            restaurée et réapparaîtra dans la
                                            liste des candidatures actives.
                                        </p>
                                    ) : (
                                        <>
                                            <p>
                                                La candidature de{" "}
                                                {application.firstName}{" "}
                                                {application.lastName} sera
                                                archivée et masquée de la liste.
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
            </div>
        </div>
    )
}
