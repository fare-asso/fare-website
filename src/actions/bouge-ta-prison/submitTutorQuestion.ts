"use server";

import prisma from "@/helpers/db";
import { sendEmail } from "@/helpers/email";
import { tutorQuestionEmailTemplate } from "@/lib/htmlEmailTemplates";
import {
    BTPTutorQuestion,
    BTPTutorQuestionSchema,
} from "@/schemas/bougeTaPrison";
import { revalidatePath } from "next/cache";

export default async function submitTutorQuestion(
    data: BTPTutorQuestion,
): Promise<{ errors?: { [x: string]: string }[]; success?: boolean }> {
    const parsedData = BTPTutorQuestionSchema.safeParse(data);

    if (!parsedData.success) {
        const issues = parsedData.error.issues.map((issue) => ({
            [issue.path[0]]: issue.message,
        }));
        return { success: false, errors: issues };
    }

    // Insert the data into the database
    const BTPTutorQuestion = await prisma.bTPTutorQuestion.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            major: data.major,
            studyYear: data.studyYear,
            question: data.message,
        },
    });

    const emailTransporterRes = await sendEmail({
        to: "intervention-carceral@fare-asso.fr",
        subject: "Nouvelle question tutorat Bouge Ta Prison",
        html: tutorQuestionEmailTemplate(data, BTPTutorQuestion.id),
    });

    revalidatePath("/dashboard/bouge-ta-prison");
    return { success: true };
}
