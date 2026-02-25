import type { Metadata } from "next"
import { Suspense } from "react"
import AddMemberButton from "@/components/dashboard/members/addMemberButton"
import MemberList from "@/components/dashboard/members/memberList"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

export const metadata: Metadata = {
    title: "Membres"
}

export default async function Membres() {
    const user = await getCurrentUserWithPermissions()
    const canCreate = !!user && hasPermission(user, "create:member")
    const canEdit = !!user && hasPermission(user, "edit:member")
    const canDelete = !!user && hasPermission(user, "delete:member")

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Membres</CardTitle>
                <CardDescription>
                    Espace de gestion des membres de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Suspense fallback={<p>Chargement...</p>}>
                    <MemberList canEdit={canEdit} canDelete={canDelete} />
                </Suspense>
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <AddMemberButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}
