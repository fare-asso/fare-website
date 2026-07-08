import type { AssistanceConfig } from "@/generated/prisma/client"
import prisma from "@/helpers/db"

export type AssistanceConfigValues = Omit<AssistanceConfig, "id">

/**
 * Returns the singleton assistance config, creating it with schema defaults
 * if it does not exist yet.
 */
export async function getAssistanceConfig(): Promise<AssistanceConfigValues> {
    const existing = await prisma.assistanceConfig.findFirst()
    if (existing) {
        return {
            recipientEmail: existing.recipientEmail,
            delay: existing.delay
        }
    }
    const created = await prisma.assistanceConfig.create({ data: {} })
    return { recipientEmail: created.recipientEmail, delay: created.delay }
}
