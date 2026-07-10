import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import ConfigForm from "./configForm"

interface DefenseDroitsPageProps {
    user: ShellUser
    pathname: string
    recipientEmail: string
    delay: string
}

export default function DefenseDroitsPage({
    user,
    pathname,
    recipientEmail,
    delay
}: DefenseDroitsPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
                <CardHeader className="p-0">
                    <CardTitle>Défense des droits</CardTitle>
                    <CardDescription>
                        Configuration du guichet de défense des droits étudiants
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-6">
                    <ConfigForm recipientEmail={recipientEmail} delay={delay} />
                </CardContent>
            </Card>
        </DashboardShell>
    )
}
