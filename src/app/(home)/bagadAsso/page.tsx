import BagadAssoForm from "@/components/public/bagadAsso/form";
import prisma from "@/helpers/db";

export default async function BagadAsso() {

    const equipmentList = await prisma.bagadAssoEquipment.findMany();

    return(
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-12 sm:py-24 md:py-32 lg:py-44 text-[3rem] font-semibold">{"Bagad'Asso"}</h1>

            {/* TODO */}
            <p className="opacity-80 italic text-red-600">présentations du projet à écrire</p>

            {/* Formulaire de demande de matériel */}
            <BagadAssoForm equipmentList={equipmentList} />
            
        </div>
        
    )
}