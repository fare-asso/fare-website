import AssociationList from "@/components/public/associations/associationList";
import AssociationMapCaller from "@/components/public/associations/map/associationMapCaller";
import prisma from "@/helpers/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réseau | FAHB",
  description: "Page des associations du réseau FAHB"
}

export default async function Reseau() {

    const assos = await prisma.association.findMany();

    return(
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-12 sm:py-24 md:py-32 lg:py-44 text-[3rem] font-semibold">Le Réseau Associatif</h1>
            <AssociationMapCaller associations={assos} />
            <AssociationList associations={assos}/>
            
        </div>
        
    )
}