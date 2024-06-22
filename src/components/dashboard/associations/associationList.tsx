
import { createClient } from "@/helpers/supabase/server"

import prisma from "@/helpers/db";
import AssociationCard from "./associationCard";

// import MemberCard from "./memberCard";

export interface Association {
    id: number;
    name: string;
    logoPath: string[];
    major: string;
    desc: string;
    birthdate: Date;
    location: string;
    website: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    discord: string | null;
}

export default async function AssociationList() {

    // create supabase client
    const supabase = createClient();

    // fetch all members from DB
    const assos = await prisma.association.findMany()

    if(assos == null) {
        return(
            <span className="text-xl text-red-800">Echec du chargement des associations, veuillez réessayer</span>
        )
    } else {

        const assoCards: JSX.Element[] = assos.map((asso) => <AssociationCard key={asso.id} association={asso}
        logoUrl={supabase.storage.from('association-pictures').getPublicUrl(asso.logoPath[0]).data.publicUrl}/>)

        return(
            <div className="w-full h-full rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 w-full h-full overflow-auto">
                    {assoCards}
                </div>
            </div>
        )
    }

}