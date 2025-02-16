"use server";

import { sendEmail } from "@/helpers/email";
import { tutorQuestionEmailTemplate } from "@/lib/htmlTemplates";
import {
    BTPTutorQuestion,
    BTPTutorQuestionSchema,
} from "@/schemas/bougeTaPrison";

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

    const emailTransporterRes = await sendEmail({
        to: "intervention-carceral@fahb.eu",
        subject: "Nouvelle question tutorat Bouge Ta Prison",
        html: tutorQuestionEmailTemplate(data),
    });
    return { success: true };
}
