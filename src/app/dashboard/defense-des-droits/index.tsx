import { createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import ConfigForm from "@/components/dashboard/defenseDesDroits/configForm"
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
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getPageConfig = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        throw redirect({ href: "/login" })
    }
    if (!hasPermission(user, "access:defense-droits")) {
        throw redirect({ href: "/dashboard/unauthorized" })
    }

    const config = await tryCatch(getAssistanceConfig())
    return config.success ? config.value : null
})

export const Route = createFileRoute("/dashboard/defense-des-droits/")({
    loader: async () => ({ config: await getPageConfig() }),
    head: () => ({ meta: [{ title: dashboardTitle("Défense des droits") }] }),
    component: DefenseDroitsPage
})

function DefenseDroitsPage() {
    const { config } = Route.useLoaderData()

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Défense des droits</CardTitle>
                <CardDescription>
                    Configuration du guichet de défense des droits étudiants
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6">
                {config ? (
                    <ConfigForm
                        recipientEmail={config.recipientEmail}
                        delay={config.delay}
                    />
                ) : (
                    <p className="text-destructive">
                        Echec du chargement de la configuration
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
