import type { ActionAPIContext } from "astro:actions"

import type { BTPTutorQuestion } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function fetchTutorQuestions(): Promise<
    BTPTutorQuestion[] | null
> {
    const questions = await tryCatch(
        prisma.bTPTutorQuestion.findMany({
            orderBy: { createdAt: "desc" }
        })
    )
    if (!questions.success) {
        captureActionError(questions.error)
        return null
    }
    return questions.value
}

async function listTutorQuestionsActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<
    | { success: true; value: BTPTutorQuestion[] }
    | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }

    const questions = await fetchTutorQuestions()
    if (!questions) {
        return { success: false, error: "Échec du chargement des questions." }
    }
    return { success: true, value: questions }
}

export const listTutorQuestionsAction = wrapAction(
    "listTutorQuestionsAction",
    listTutorQuestionsActionImpl
)
