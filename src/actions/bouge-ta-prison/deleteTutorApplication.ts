"use server"

import type { BTPTutorApplication } from "@prisma/client"
import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"

export default async function deleteTutorApplication(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    // Fetch current application
    let application: BTPTutorApplication | null
    try {
        application = await prisma.bTPTutorApplication.findUnique({
            where: {
                id
            }
        })

        if (!application) {
            return { error: "Candidature non trouvée" }
        }
    } catch (_error) {
        return { error: "Echec de la récupération de la candidature" }
    }

    // Delete files from storage
    const cvPath = application.cvPath
    const mlPath = application.mlPath

    const { data: fileDeletionData, error: fileDeletionError } =
        await supabase.storage
            .from("btp-tutor-application")
            .remove([cvPath, mlPath])

    if (fileDeletionError) {
        return { error: "Echec de la suppression des fichiers" }
    }

    // Delete the application
    try {
        const _deletedApplication = await prisma.bTPTutorApplication.delete({
            where: {
                id
            }
        })
    } catch (_error) {
        return { error: "Echec de la suppression de la candidature" }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}
