"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { sanitizeString } from "@/helpers/string"
import { createClient } from "@/helpers/supabase/server"
import { tutorApplicationEmailTemplate } from "@/lib/htmlEmailTemplates"
import { BTPTutorApplicationSchema } from "@/schemas/bougeTaPrison"

export default async function submitTutorApplication(
    formData: FormData
): Promise<{ success: boolean; errors?: { [x: string]: string }[] }> {
    const data: { [key: string]: FormDataEntryValue } = {}

    formData.forEach((value, key) => {
        data[key] = value
    })

    const parsedData = BTPTutorApplicationSchema.safeParse(data)

    if (!parsedData.success) {
        const issues = parsedData.error.issues.map((issue) => ({
            [issue.path[0]]: issue.message
        }))
        return { success: false, errors: issues }
    }

    // Generate a random folder name for the storage
    const sanitizedName =
        sanitizeString(parsedData.data.firstName.toLowerCase().at(0)!) +
        sanitizeString(parsedData.data.lastName.toLowerCase())

    const folderName = `${crypto.randomUUID()}-${sanitizedName}`

    // Upload the CV and the motivation letter to the storage
    const supabase = await createClient()

    const { data: cvUploadData, error: cvUploadError } = await supabase.storage
        .from("btp-tutor-application")
        .upload(`${folderName}/cv-${sanitizedName}.pdf`, parsedData.data.cv)
    if (cvUploadError) {
        return {
            success: false,
            errors: [{ cv: "Echec de l'upload du fichier" }]
        }
    }

    const { data: lmUploadData, error: lmUploadError } = await supabase.storage
        .from("btp-tutor-application")
        .upload(
            `${folderName}/lm-${sanitizedName}.pdf`,
            parsedData.data.motivationLetter
        )
    if (lmUploadError) {
        return {
            success: false,
            errors: [{ motivationLetter: "Echec de l'upload du fichier" }]
        }
    }

    // Insert the application in the database
    try {
        await prisma.bTPTutorApplication.create({
            data: {
                firstName: parsedData.data.firstName,
                lastName: parsedData.data.lastName,
                email: parsedData.data.email,
                major: parsedData.data.major,
                studyYear: parsedData.data.studyYear,
                cvPath: cvUploadData.path,
                mlPath: lmUploadData.path
            }
        })
    } catch (e) {
        console.error(e)
        return { success: false }
    }

    // Send email to the btp team
    const _emailResponse = await sendEmail({
        to: "intervention-carceral@fare-asso.fr",
        subject: "Nouvelle candidature de tuteur Bouge Ta Prison",
        html: tutorApplicationEmailTemplate(parsedData.data)
    })

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}
