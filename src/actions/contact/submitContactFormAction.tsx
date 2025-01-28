"use server";

import { sendEmail } from "@/helpers/email";
import { z } from "zod";
import { Contact, ContactSchema } from "@/schemas/contact";
import { contactEmailTemplate } from "@/lib/htmlTemplates";

export default async function submitContactFormAction(
    data: Contact,
): Promise<{ success?: boolean; errors?: { [x: string]: string }[] }> {
    const parsed = ContactSchema.safeParse(data);

    if (!parsed.success) {
        const zodErrors = parsed.error.issues.map((issue) => ({
            [issue.path[0]]: issue.message,
        }));
        return { errors: zodErrors };
    }

    const emailTransporterRes = await sendEmail({
        to: "contact@fahb.eu",
        subject: `${parsed.data.firstName} ${parsed.data.lastName} veut vous contacter`,
        html: contactEmailTemplate(parsed.data),
    });

    if (emailTransporterRes.error) return { success: false };

    return { success: true };
}
