import { format } from "date-fns"
import {
    BookOpenIcon,
    CheckCircleIcon,
    ClockIcon,
    FileTextIcon,
    GraduationCapIcon,
    SquareUserRoundIcon
} from "lucide-react"
import Link from "next/link"
import { FaCaretLeft, FaEnvelope } from "react-icons/fa"
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
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import SendApprovalButton from "./sendApprovalButton"

export default async function TutorApplicationPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id

    if (Number.isNaN(Number(id))) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <span className="text-4xl">😔</span>
                        <p className="mt-4 text-lg text-muted-foreground">
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

    const tutorApplication = await prisma.bTPTutorApplication.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!tutorApplication) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <span className="text-4xl">😔</span>
                        <p className="mt-4 text-lg text-muted-foreground">
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

    const supabase = await createClient()

    const { data: cvSignedUrlData, error: cvSignedUrlError } =
        await supabase.storage
            .from("btp-tutor-application")
            .createSignedUrl(tutorApplication.cvPath, 3600)

    const { data: lmSignedUrlData, error: lmSignedUrlError } =
        await supabase.storage
            .from("btp-tutor-application")
            .createSignedUrl(tutorApplication.mlPath, 3600)

    return (
        <div className="h-full w-full px-2 md:px-4">
            {/* Header */}
            <div className="mb-6">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="-ml-3 mb-4"
                >
                    <Link href="/dashboard/bouge-ta-prison?tab=candidatures">
                        <FaCaretLeft className="mr-1" />
                        Retour aux candidatures
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-bold text-3xl">
                        Candidature{" "}
                        <span className="font-mono text-muted-foreground">
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
                                <p className="font-medium text-lg">
                                    {tutorApplication.firstName}{" "}
                                    {tutorApplication.lastName}
                                </p>
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <a
                                    href={`mailto:${tutorApplication.email}`}
                                    className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
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
                                    <BookOpenIcon className="size-4 text-muted-foreground" />
                                    <span>Filière :</span>
                                    <span className="font-medium">
                                        {tutorApplication.major}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCapIcon className="size-4 text-muted-foreground" />
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
                                    {cvSignedUrlError ? (
                                        <span className="text-muted-foreground text-sm">
                                            Indisponible
                                        </span>
                                    ) : (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <a
                                                href={cvSignedUrlData.signedUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Télécharger
                                            </a>
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">📝</Badge>
                                        <span className="font-medium">
                                            Lettre de motivation
                                        </span>
                                    </div>
                                    {lmSignedUrlError ? (
                                        <span className="text-muted-foreground text-sm">
                                            Indisponible
                                        </span>
                                    ) : (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <a
                                                href={lmSignedUrlData.signedUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Télécharger
                                            </a>
                                        </Button>
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
