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

import { DashboardShell } from "@/components/dashboard/shell"
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
import type { BTPTutorApplication } from "@/generated/prisma/client"

import SendApprovalButton from "./sendApprovalButton"

interface CandidatureDetailPageProps {
    application: BTPTutorApplication
    cvUrl: string | null
    lmUrl: string | null
}

function CandidatureDetailContent({
    application,
    cvUrl,
    lmUrl
}: CandidatureDetailPageProps) {
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
                    <a href="/dashboard/bouge-ta-prison">
                        <FaCaretLeft className="mr-1" />
                        Retour aux candidatures
                    </a>
                </Button>

                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">
                        Candidature{" "}
                        <span className="text-muted-foreground font-mono">
                            #{application.id}
                        </span>
                    </h1>
                    <Badge variant="secondary">
                        Soumise le{" "}
                        {format(application.createdAt, "dd/MM/yyyy 'à' HH:mm")}
                    </Badge>
                    {application.approved ? (
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
                                    {application.firstName}{" "}
                                    {application.lastName}
                                </p>
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <a
                                    href={`mailto:${application.email}`}
                                    className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                                >
                                    <FaEnvelope className="text-muted-foreground" />
                                    {application.email}
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
                                        {application.major}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCapIcon className="text-muted-foreground size-4" />
                                    <span>Année d'études :</span>
                                    <span className="font-medium">
                                        {application.studyYear}
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
                    {application.approved ? (
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
                                <SendApprovalButton application={application} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function CandidatureDetailPage({
    ...rest
}: CandidatureDetailPageProps) {
    return (
        <DashboardShell>
            <CandidatureDetailContent {...rest} />
        </DashboardShell>
    )
}
