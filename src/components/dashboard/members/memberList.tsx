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
            <div className="h-full w-full rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <div className="grid h-full w-full grid-cols-1 gap-8 overflow-y-auto sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                    {memberCards}
                </div>
            </div>
        );
    }
}
