import { format } from "date-fns"
import {
    BookOpenIcon,
    GraduationCapIcon,
    MessageSquareTextIcon,
    SquareUserRoundIcon
} from "lucide-react"
import type { Metadata } from "next"
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
import QuestionActions from "./questionActions"

export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const id = (await params).id
    return {
        title: `BTP - Question ${id}`
    }
}

export default async function TutorQuestionPage({
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
                        <p className="text-muted-foreground mt-4 text-lg">
                            Cette question n'existe pas
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/dashboard/bouge-ta-prison/questions">
                                Retour aux questions
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const tutorQuestion = await prisma.bTPTutorQuestion.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!tutorQuestion) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <span className="text-4xl">😔</span>
                        <p className="text-muted-foreground mt-4 text-lg">
                            Cette question n'existe pas ou plus
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/dashboard/bouge-ta-prison/questions">
                                Retour aux questions
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

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
                    <Link href="/dashboard/bouge-ta-prison/questions">
                        <FaCaretLeft className="mr-1" />
                        Retour aux questions
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">
                        Question{" "}
                        <span className="text-muted-foreground font-mono">
                            #{tutorQuestion.id}
                        </span>
                    </h1>
                    <Badge variant="secondary">
                        Soumise le{" "}
                        {format(
                            tutorQuestion.createdAt,
                            "dd/MM/yyyy 'à' HH:mm"
                        )}
                    </Badge>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 pb-8 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Question Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquareTextIcon className="size-5" />
                                <span>Message</span>
                            </CardTitle>
                            <CardDescription>
                                Question posée par l'utilisateur
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted/50 rounded-lg border p-4">
                                <p className="text-justify leading-relaxed whitespace-break-spaces">
                                    {tutorQuestion.question}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Personal Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SquareUserRoundIcon className="size-5" />
                                <span>Informations personnelles</span>
                            </CardTitle>
                            <CardDescription>
                                Coordonnées de la personne
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-lg font-medium">
                                    {tutorQuestion.firstName}{" "}
                                    {tutorQuestion.lastName}
                                </p>
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <a
                                    href={`mailto:${tutorQuestion.email}`}
                                    className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                                >
                                    <FaEnvelope className="text-muted-foreground" />
                                    {tutorQuestion.email}
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
                                        {tutorQuestion.major}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCapIcon className="text-muted-foreground size-4" />
                                    <span>Année d'études :</span>
                                    <span className="font-medium">
                                        {tutorQuestion.studyYear}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Question Actions */}
                    <QuestionActions
                        questionId={tutorQuestion.id}
                        questionAuthor={`${tutorQuestion.firstName} ${tutorQuestion.lastName}`}
                        isArchived={tutorQuestion.archived !== null}
                    />
                </div>
            </div>
        </div>
    )
}
