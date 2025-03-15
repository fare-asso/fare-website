"use server";

import prisma from "@/helpers/db";
import { BTPTutorApplication } from "@prisma/client";
import { revalidatePath } from "next/cache";

export default async function sendApprovalEmail(
    application: BTPTutorApplication,
): Promise<{
    success: boolean;
    error: string | null;
}> {
    console.log("Sending approval email to", application.email);
    const updatedApplication = await prisma.bTPTutorApplication.update({
        where: {
            id: application.id,
        },
        data: {
            approved: true,
        },
    });
    revalidatePath("/dashboard/bouge-ta-prison/candidatures-tutorat/18");
    revalidatePath("/dashboard/bouge-ta-prison?tab=candidatures");
    return {
        success: true,
        error: null,
    };
}
