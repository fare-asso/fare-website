import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { format } from "date-fns"
import {
    BookOpenIcon,
    CheckCircleIcon,
    ClockIcon,
    FileTextIcon,
    GraduationCapIcon,
    SquareUserRoundIcon
} from "lucide-react"
import { FaCaretLeft, FaEnvelope } from "react-icons/fa"

import SendApprovalButton from "@/components/dashboard/bougeTaPrison/sendApprovalButton"
import Link from "@/components/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import prisma from "@/helpers/db.server"
import { createClient } from "@/helpers/supabase.server"
import { captureActionError } from "@/lib/sentry"
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getTutorApplication = createServerFn()
    .validator((id: number) => id)
    .handler(async ({ data: id }) => {
        const result = await tryCatch(
            prisma.bTPTutorApplication.findUnique({ where: { id } })
        )
        if (!result.success) {
            captureActionError(result.error)
            return null
        }
        const application = result.value
        if (!application) return null

        const supabase = createClient()

        const { data: cvSignedUrlData } = await supabase.storage
            .from("btp-tutor-application")
            .createSignedUrl(application.cvPath, 3600)

        const { data: lmSignedUrlData } = await supabase.storage
            .from("btp-tutor-application")
            .createSignedUrl(application.mlPath, 3600)

        return {
            application,
            cvUrl: cvSignedUrlData?.signedUrl ?? null,
            lmUrl: lmSignedUrlData?.signedUrl ?? null
        }
    })

export const Route = createFileRoute(
    "/dashboard/bouge-ta-prison/candidatures-tutorat/$id"
)({
    loader: async ({ params }) => {
        const id = Number(params.id)
        return {
            id: params.id,
            data: Number.isNaN(id)
                ? null
                : await getTutorApplication({ data: id })
        }
    },
    head: ({ loaderData }) => ({
        meta: [{ title: dashboardTitle(`BTP - Candidature ${loaderData?.id}`) }]
    }),
    component: TutorApplicationPage
})

function ApplicationNotFound() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Card className="max-w-md">
                <CardContent className="pt-6 text-center">
                    <span className="text-4xl">😔</span>
                    <p className="text-muted-foreground mt-4 text-lg">
                        Cette candidature n'existe pas
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/bouge-ta-prison?tab=candidatures">
                            Retour aux candidatures
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function TutorApplicationPage() {
    const { data } = Route.useLoaderData()

    if (!data) {
        return <ApplicationNotFound />
    }

    const { application: tutorApplication, cvUrl, lmUrl } = data

    return (
        <div className="h-full w-full px-2 md:px-4">
            {/* Header */}
            <div className="mb-6">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="mb-4 -ml-3"
                >
                    <Link href="/dashboard/bouge-ta-prison">
                        <FaCaretLeft className="mr-1" />
                        Retour aux candidatures
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">
                        Candidature{" "}
                        <span className="text-muted-foreground font-mono">
                            #{tutorApplication.id}
                        </span>
                    </h1>
                    <Badge variant="secondary">
                        Soumise le{" "}
                        {format(
                            tutorApplication.createdAt,
                            "dd/MM/yyyy 'à' HH:mm"
                        )}
                    </Badge>
                    {tutorApplication.approved ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                            <CheckCircleIcon className="mr-1 size-3" />
                            Approuvée
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-amber-600">
                            <ClockIcon className="mr-1 size-3" />
                            En attente
                        </Badge>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 pb-8 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Personal Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SquareUserRoundIcon className="size-5" />
                                <span>Informations personnelles</span>
                            </CardTitle>
                            <CardDescription>
                                Coordonnées du candidat
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-lg font-medium">
                                    {tutorApplication.firstName}{" "}
                                    {tutorApplication.lastName}
                                </p>
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <a
                                    href={`mailto:${tutorApplication.email}`}
                                    className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                                >
                                    <FaEnvelope className="text-muted-foreground" />
                                    {tutorApplication.email}
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCapIcon className="size-5" />
                                <span>Parcours académique</span>
                            </CardTitle>
                            <CardDescription>
                                Informations sur les études
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <BookOpenIcon className="text-muted-foreground size-4" />
                                    <span>Filière :</span>
                                    <span className="font-medium">
                                        {tutorApplication.major}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCapIcon className="text-muted-foreground size-4" />
                                    <span>Année d'études :</span>
                                    <span className="font-medium">
                                        {tutorApplication.studyYear}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Documents Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileTextIcon className="size-5" />
                                <span>Documents</span>
                            </CardTitle>
                            <CardDescription>
                                Fichiers joints à la candidature
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y rounded-lg border">
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">📄</Badge>
                                        <span className="font-medium">CV</span>
                                    </div>
                                    {cvUrl ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <a
                                                href={cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Télécharger
                                            </a>
                                        </Button>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">
                                            Indisponible
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">📝</Badge>
                                        <span className="font-medium">
                                            Lettre de motivation
                                        </span>
                                    </div>
                                    {lmUrl ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <a
                                                href={lmUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Télécharger
                                            </a>
                                        </Button>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">
                                            Indisponible
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Approval Status Card */}
                    {tutorApplication.approved ? (
                        <Card className="border-green-500/20 bg-green-500/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircleIcon className="size-5 text-green-600" />
                                    <span>Candidature approuvée</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    Cette candidature a été validée et le
                                    candidat a été notifié par email.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-amber-500/20 bg-amber-500/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClockIcon className="size-5 text-amber-600" />
                                    <span>En attente d'approbation</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground text-sm">
                                    Cette candidature n'a pas encore été
                                    approuvée. Cliquez sur le bouton ci-dessous
                                    pour valider et envoyer un email de
                                    confirmation au candidat.
                                </p>
                                <SendApprovalButton
                                    application={tutorApplication}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
