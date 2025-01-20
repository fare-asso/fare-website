import { createClient } from "@/helpers/supabase/server";

import prisma from "@/helpers/db";

import MemberCard from "./memberCard";

export default async function MemberList() {
    // create supabase client
    const supabase = createClient();

    // fetch all members from DB
    const members = await prisma.member.findMany();

    if (members == null) {
        return (
            <span className="text-xl text-red-800">
                Echec du chargement des membres, veuillez réessayer
            </span>
        );
    } else {
        const memberCards: JSX.Element[] = members.map((member) => (
            <MemberCard
                key={member.id}
                member={member}
                pictureUrl={
                    supabase.storage
                        .from("member-pictures")
                        .getPublicUrl(member.picturePath).data.publicUrl
                }
            />
        ));

        return (
            <div className="w-full h-full rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 w-full h-full overflow-y-auto">
                    {memberCards}
                </div>
            </div>
        );
    }
}
