import { Await, createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import AddMemberButton from "@/components/dashboard/members/addMemberButton"
import MemberList, {
    type MemberWithPicture
} from "@/components/dashboard/members/memberList"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getMembresPerms = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    return {
        canCreate: !!user && hasPermission(user, "create:member"),
        canEdit: !!user && hasPermission(user, "edit:member"),
        canDelete: !!user && hasPermission(user, "delete:member")
    }
})

const getMembers = createServerFn().handler(
    async (): Promise<MemberWithPicture[] | null> => {
        const supabase = createClient()

        const members = await tryCatch(
            prisma.member.findMany({
                orderBy: [{ order: "asc" }, { id: "asc" }]
            })
        )
        if (!members.success) {
            return null
        }

        return members.value.map((member) => ({
            member: {
                ...member,
                order: member.order ?? 0
            },
            pictureUrl: supabase.storage
                .from("member-pictures")
                .getPublicUrl(member.picturePath).data.publicUrl
        }))
    }
)

export const Route = createFileRoute("/dashboard/membres/")({
    loader: async () => ({
        perms: await getMembresPerms(),
        members: getMembers()
    }),
    head: () => ({ meta: [{ title: dashboardTitle("Membres") }] }),
    component: Membres
})

function Membres() {
    const { perms, members } = Route.useLoaderData()

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Membres</CardTitle>
                <CardDescription>
                    Espace de gestion des membres de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Await promise={members} fallback={<p>Chargement...</p>}>
                    {(value) => (
                        <MemberList
                            members={value}
                            canEdit={perms.canEdit}
                            canDelete={perms.canDelete}
                        />
                    )}
                </Await>
            </CardContent>
            {perms.canCreate ? (
                <CardFooter className="p-0">
                    <AddMemberButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}
