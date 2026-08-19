import { format } from "date-fns"
import {
    BookOpenIcon,
    GraduationCapIcon,
    MessageSquareTextIcon,
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
import type { BTPTutorQuestion } from "@/generated/prisma/client"

import QuestionActions from "./questionActions"

interface QuestionDetailPageProps {
    question: BTPTutorQuestion
}

function QuestionDetailContent({ question }: QuestionDetailPageProps) {
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
                    <a href="/dashboard/bouge-ta-prison/questions">
                        <FaCaretLeft className="mr-1" />
                        Retour aux questions
                    </a>
                </Button>

                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">
                        Question{" "}
                        <span className="text-muted-foreground font-mono">
                            #{question.id}
                        </span>
                    </h1>
                    <Badge variant="secondary">
                        Soumise le{" "}
                        {format(question.createdAt, "dd/MM/yyyy 'à' HH:mm")}
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
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted/50 rounded-lg border p-4">
                                <p className="text-justify leading-relaxed whitespace-break-spaces">
                                    {question.question}
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
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-lg font-medium">
                                    {question.firstName} {question.lastName}
                                </p>
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <a
                                    href={`mailto:${question.email}`}
                                    className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                                >
                                    <FaEnvelope className="text-muted-foreground" />
                                    {question.email}
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
                                        {question.major}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCapIcon className="text-muted-foreground size-4" />
                                    <span>Année d'études :</span>
                                    <span className="font-medium">
                                        {question.studyYear}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Question Actions */}
                    <QuestionActions
                        questionId={question.id}
                        questionAuthor={`${question.firstName} ${question.lastName}`}
                        isArchived={question.archived !== null}
                    />
                </div>
            </div>
        </div>
    )
}

export default function QuestionDetailPage({
    ...rest
}: QuestionDetailPageProps) {
    return (
        <DashboardShell>
            <QuestionDetailContent {...rest} />
        </DashboardShell>
    )
}
