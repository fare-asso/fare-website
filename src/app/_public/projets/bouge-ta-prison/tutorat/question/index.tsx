import { createFileRoute } from "@tanstack/react-router"

import QuestionForm from "@/components/public/bougeTaPrison/QuestionForm"
import { pageTitle } from "@/lib/seo"

export const Route = createFileRoute(
    "/_public/projets/bouge-ta-prison/tutorat/question/"
)({
    head: () => ({
        meta: [{ title: pageTitle("Questions Bouge ta Prison") }]
    }),
    component: Question
})

function Question() {
    return (
        <div className="w-full md:w-1/2">
            <QuestionForm />
        </div>
    )
}
