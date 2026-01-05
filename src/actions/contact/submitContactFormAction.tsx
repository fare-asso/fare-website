"use server"

import { render } from "@react-email/render"
import { sendEmail } from "@/helpers/email"
import { type Contact, ContactSchema } from "@/schemas/contact"
import ContactTemplate from "../../../emails/contact"

export default async function submitContactFormAction(
    data: Contact
): Promise<{ success?: boolean; errors?: { [x: string]: string }[] }> {
    const parsed = ContactSchema.safeParse(data)

    if (!parsed.success) {
        const zodErrors = parsed.error.issues.map((issue) => ({
            [issue.path[0]]: issue.message
        }))
        return { errors: zodErrors }
    }

    const emailTransporterRes = await sendEmail({
        to: "contact@fare-asso.fr",
        subject: `${parsed.data.firstName} ${parsed.data.lastName} veut vous contacter`,
        html: await render(
            <ContactTemplate
                firstName={parsed.data.firstName}
                lastName={parsed.data.lastName}
                message={parsed.data.message}
                email={parsed.data.email}
            />
        )
    })

    if (emailTransporterRes.error) return { success: false }

    return { success: true }
}
