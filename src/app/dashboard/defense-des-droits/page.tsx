import type { Metadata } from "next"
import { redirect } from "next/navigation"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { getAssistanceConfig } from "@/helpers/assistanceConfig"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

import ConfigForm from "./configForm"

export const metadata: Metadata = {
    title: "Défense des droits"
}

export default async function DefenseDroitsPage() {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        redirect("/login")
    }
    if (!hasPermission(user, "access:defense-droits")) {
        redirect("/dashboard/unauthorized")
    }

    const config = await getAssistanceConfig()

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Défense des droits</CardTitle>
                <CardDescription>
                    Configuration du guichet de défense des droits étudiants
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6">
                <ConfigForm
                    recipientEmail={config.recipientEmail}
                    delay={config.delay}
                />
            </CardContent>
        </Card>
    )
}
