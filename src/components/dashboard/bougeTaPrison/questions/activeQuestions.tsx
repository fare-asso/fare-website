import type { BTPTutorQuestion } from "@/generated/prisma/client"

import QuestionCard from "./questionCard"

export default function ActiveQuestions({
    questions
}: {
    questions: BTPTutorQuestion[]
}) {
    return (
        <div className="@container flex h-full flex-col">
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold">
                    {questions.length} question
                    {questions.length > 1 ? "s" : ""}
                </span>{" "}
                active{questions.length > 1 ? "s" : ""}.
            </p>
            <div className="flex-1 overflow-y-auto">
                {questions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 @min-2xl:grid-cols-2">
                        {questions.map((question) => (
                            <QuestionCard
                                question={question}
                                key={question.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-muted/30 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                        <p className="text-muted-foreground font-medium">
                            Aucune question pour le moment
                        </p>
                        <p className="text-muted-foreground/70 mt-1 text-sm">
                            Les questions apparaîtront ici
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
