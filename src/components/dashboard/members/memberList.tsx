import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"

import MemberCard from "./memberCard"

export default async function MemberList() {
    // create supabase client
    const supabase = await createClient()

    // fetch all members from DB
    const members = await prisma.member.findMany()

    if (members == null) {
        return (
            <span className="text-red-800 text-xl">
                Echec du chargement des membres, veuillez réessayer
            </span>
        )
    } else {
        const memberCards = members.map((member) => (
            <MemberCard
                key={member.id}
                member={member}
                pictureUrl={
                    supabase.storage
                        .from("member-pictures")
                        .getPublicUrl(member.picturePath).data.publicUrl
                }
            />
        ))

        return (
            <div className="h-full w-full overflow-y-auto rounded-lg border bg-card p-6 text-card-foreground shadow-xs">
                <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                    {memberCards}
                </div>
            </div>
        )
    }
}
