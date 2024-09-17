import AssociationList from "@/components/public/associations/associationList";
import AssociationMapCaller from "@/components/public/associations/map/associationMapCaller";
import prisma from "@/helpers/db";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Réseau | FAHB",
  description: "Page des associations du réseau FAHB"
}

export default async function Reseau() {

    const assos = await prisma.association.findMany({
        orderBy: {
            name: 'asc'
        }
    });

    return(
        <div className="flex flex-col items-center justify-start w-full pb-20">
            <h1 className="py-12 sm:py-24 md:py-32 lg:py-44 text-[3rem] font-semibold">Le Réseau Associatif</h1>
            <AssociationMapCaller associations={assos} />
            <AssociationList associations={assos}/>
            
            {/* Nous rejoindre card */}
            <div className="w-full md:w-1/2 flex flex-col p-8 rounded-xl bg-black text-white">
                <h2 className="text-lg font-semibold mb-2">Votre association souhaite intégrer notre réseau ? </h2>
                <p>
                    La FAHB accueille de nouveaux membres
                    partageant nos objectifs pour la vie étudiante. En nous rejoignant, vous aurez accès à notre réseau, nos ressources
                    et notre soutien. <br />Pour plus d'informations sur l'adhésion, cliquez ci-dessous.
                </p>
                <Link href="/adhesion" className="rounded-full font-semibold bg-white text-black border-white px-4 py-2 mt-4 ml-auto text-center w-full md:w-1/3 hover:scale-105 transition-all">Nous rejoindre</Link>
            </div>
            
        </div>
        
    )
}