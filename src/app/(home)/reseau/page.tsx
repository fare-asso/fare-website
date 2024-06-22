
import AssociationCard from "@/components/dashboard/associations/associationCard";
import AssociationMapCaller from "@/components/public/associations/associationMapCaller";
import AssociationMap from "@/components/public/associations/associationsMap";
import prisma from "@/helpers/db";
import { createClient } from "@/helpers/supabase/server";

export default async function Reseau() {

    const supabase = createClient();

    const assos = await prisma.association.findMany();
    const assoCards = assos.map((asso) => <AssociationCard key={asso.id} association={asso} logoUrl={supabase.storage.from('association-pictures').getPublicUrl(asso.logoPath[0]).data.publicUrl}/>)
    return(
        <div className="flex flex-col items-center justify-start">
            <h1 className="py-44 text-3xl font-semibold">Le Réseau Associatif</h1>
            <AssociationMapCaller associations={assos} />
            <div className="grid grid-cols-4 gap-8 w-3/4 h-full">
                {assoCards}
            </div>
        </div>
        
    )
}