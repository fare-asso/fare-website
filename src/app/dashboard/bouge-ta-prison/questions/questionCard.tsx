"use client"

import type { BTPTutorQuestion } from "@prisma/client"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    ArchiveIcon,
    ArchiveRestoreIcon,
    CalendarIcon,
    GraduationCapIcon,
    MailIcon,
    MessageSquareTextIcon
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import archiveTutorQuestion from "@/actions/bouge-ta-prison/archiveTutorQuestion"
import unarchiveTutorQuestion from "@/actions/bouge-ta-prison/unarchiveTutorQuestion"
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
import { useToast } from "@/components/ui/use-toast"

export default function QuestionCard({
    question
}: {
    question: BTPTutorQuestion
}) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const isArchived = question.archived !== null

    const onArchive = async () => {
        setIsLoading(true)
        const response = await archiveTutorQuestion(question.id)

        if (response.error) {
            toast({
                variant: "destructive",
                description: response.error,
                title: "Erreur"
            })
        } else {
            toast({
                variant: "default",
                description: "La question a été archivée.",
                title: "Succès"
            })
        }
        setIsLoading(false)
    }

    const onUnarchive = async () => {
        setIsLoading(true)
        const response = await unarchiveTutorQuestion(question.id)

        if (response.error) {
            toast({
                variant: "destructive",
                description: response.error,
                title: "Erreur"
            })
        } else {
            toast({
                variant: "default",
                description: "La question a été désarchivée.",
                title: "Succès"
            })
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
        if (question.read) {
            return (
                <Badge
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                >
                    Lue
                </Badge>
            )
        }
        return <Badge variant="secondary">Non lue</Badge>
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
                <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge()}
                    <span className="text-muted-foreground text-xs">
                        #{question.id}
                    </span>
                </div>

                <Link
                    href={`/dashboard/bouge-ta-prison/questions/${question.id}`}
                    className="font-semibold text-base transition-colors hover:text-primary hover:underline"
                >
                    {question.firstName} {question.lastName}
                </Link>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1.5">
                        <MailIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{question.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <GraduationCapIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {question.major} — {question.studyYear}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {format(question.createdAt, "d MMM yyyy", {
                                locale: fr
                            })}
                        </span>
                    </div>
                </div>

                {/* Question preview */}
                <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
                    <MessageSquareTextIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2">{question.question}</span>
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
                                    ? "Désarchiver la question ?"
                                    : "Archiver la question ?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div>
                                    {isArchived ? (
                                        <p>
                                            La question de {question.firstName}{" "}
                                            {question.lastName} sera restaurée
                                            et réapparaîtra dans la liste des
                                            questions actives.
                                        </p>
                                    ) : (
                                        <>
                                            <p>
                                                La question de{" "}
                                                {question.firstName}{" "}
                                                {question.lastName} sera
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
