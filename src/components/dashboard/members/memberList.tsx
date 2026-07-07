import type { Member } from "@/generated/prisma/client"

import SortableMemberList from "./sortableMemberList"

export type MemberWithPicture = {
    member: Member
    pictureUrl: string
}

interface MemberListProps {
    members: MemberWithPicture[] | null
    canEdit: boolean
    canDelete: boolean
}

export default function MemberList({
    members,
    canEdit,
    canDelete
}: MemberListProps) {
    if (members == null) {
        return (
            <span className="text-xl text-red-800">
                Echec du chargement des membres, veuillez réessayer
            </span>
        )
    }

    return (
        <SortableMemberList
            initialMembers={members}
            canEdit={canEdit}
            canDelete={canDelete}
        />
    )
}
