import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import type { MemberWithPicture } from "@/actions/members/listMembersAction"
import { DashboardShell } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import AddMemberButton from "./addMemberButton"
import SortableMemberList from "./sortableMemberList"

interface MembersPageProps {
    initialMembers: MemberWithPicture[]
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
}

function MembersContent({
    initialMembers,
    canCreate,
    canEdit,
    canDelete
}: MembersPageProps) {
    const { data: members } = useQuery({
        queryKey: ["members"],
        queryFn: async () => {
            const { data, error } = await actions.members.listMembersAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des membres.")
            }
            return data.value
        },
        initialData: initialMembers
    })

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Membres</CardTitle>
                <CardDescription>
                    Espace de gestion des membres de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <SortableMemberList
                    initialMembers={members}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <AddMemberButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}

export default function MembersPage({ ...rest }: MembersPageProps) {
    return (
        <DashboardShell>
            <MembersContent {...rest} />
        </DashboardShell>
    )
}
