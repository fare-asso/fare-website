"use server"

import { render } from "@react-email/render"
import { revalidatePath } from "next/cache"
import { isDevelopment } from "std-env"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import {
    type BTPTutorQuestion,
    BTPTutorQuestionSchema
} from "@/schemas/bougeTaPrison"
import { BtpContact } from "../../../emails/btp-contact"

export default async function submitTutorQuestion(
    data: BTPTutorQuestion
): Promise<{ errors?: { [x: string]: string }[]; success?: boolean }> {
    const parsedData = BTPTutorQuestionSchema.safeParse(data)

    if (!parsedData.success) {
        const issues = parsedData.error.issues.map((issue) => ({
            [issue.path[0]]: issue.message
        }))
        return { success: false, errors: issues }
    }

    // Insert the data into the database
    const BTPTutorQuestion = await prisma.bTPTutorQuestion.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            major: data.major,
            studyYear: data.studyYear,
            question: data.message
        }
    })

    if (!isDevelopment) {
        await sendEmail({
            to: "intervention-carceral@fare-asso.fr",
            subject: "Nouvelle question tutorat Bouge Ta Prison",
            html: await render(
                <BtpContact
                    firstName={data.firstName}
                    lastName={data.lastName}
                    email={data.email}
                    message={data.message}
                    id={BTPTutorQuestion.id}
                />
            )
        })
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}
