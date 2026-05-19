import type { Metadata } from "next"

import QuestionForm from "./QuestionForm"

export const metadata: Metadata = {
    title: "Questions Bouge ta Prison"
}
export default function Question() {
    return (
        <div className="w-full md:w-1/2">
            <QuestionForm />
        </div>
    )
}
