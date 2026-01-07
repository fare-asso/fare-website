import prisma from "@/helpers/db"
import QuestionCard from "./questionCard"

export default async function ArchivedQuestions() {
    const questions = await prisma.bTPTutorQuestion.findMany({
        where: {
            archived: {
                not: null
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return (
        <div className="@container flex h-full flex-col">
            <p className="my-4 text-gray-500 text-sm">
                <span className="font-bold">
                    {questions.length} question
                    {questions.length > 1 ? "s" : ""}
                </span>{" "}
                archivée{questions.length > 1 ? "s" : ""}.
            </p>
            <div className="flex-1 overflow-y-auto">
                {questions.length > 0 ? (
                    <div className="grid @min-2xl:grid-cols-2 grid-cols-1 gap-3">
                        {questions.map((question) => (
                            <QuestionCard
                                question={question}
                                key={question.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30">
                        <p className="font-medium text-muted-foreground">
                            Aucune question archivée
                        </p>
                        <p className="mt-1 text-muted-foreground/70 text-sm">
                            Les questions archivées apparaîtront ici
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
