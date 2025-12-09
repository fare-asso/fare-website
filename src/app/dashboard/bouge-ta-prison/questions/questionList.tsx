import prisma from "@/helpers/db"
import QuestionCard from "./questionCard"

export default async function QuestionList() {
    const questions = await prisma.bTPTutorQuestion.findMany({
        orderBy: {
            createdAt: "desc"
        }
    })
    return (
        <div className="flex h-full flex-col items-center space-y-2 rounded-lg border p-4 shadow-xs">
            {questions.length > 0 ? (
                questions.map((question) => (
                    <QuestionCard question={question} key={question.id} />
                ))
            ) : (
                <span className="text-sm opacity-50">
                    Il n'y a pas encore de questions.😔
                </span>
            )}
        </div>
    )
}
