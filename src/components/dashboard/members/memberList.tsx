import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"

import SortableMemberList from "./sortableMemberList"

export default async function MemberList() {
    // create supabase client
    const supabase = await createClient()

    // fetch all members from DB, ordered by order field then by id
    const members = await prisma.member.findMany({
        orderBy: [{ order: "asc" }, { id: "asc" }]
    })

    if (members == null) {
        return (
            <span className="text-red-800 text-xl">
                Echec du chargement des membres, veuillez réessayer
            </span>
        )
    }

    // Prepare members with their picture URLs
    const membersWithPictures = members.map((member) => ({
        member: {
            ...member,
            order: member.order ?? 0
        },
        pictureUrl: supabase.storage
            .from("member-pictures")
            .getPublicUrl(member.picturePath).data.publicUrl
    }))

    return <SortableMemberList initialMembers={membersWithPictures} />
}
