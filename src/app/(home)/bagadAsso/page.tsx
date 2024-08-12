import BagadAssoForm from "@/components/public/bagadAsso/form";

export default async function Reseau() {

    return(
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-12 sm:py-24 md:py-32 lg:py-44 text-[3rem] font-semibold">{"Bagad'Asso"}</h1>

            {/* TODO */}
            <p className="opacity-80 italic text-red-600">présentations du projet à écrire</p>

            {/* Formulaire de demande de matériel */}
            <BagadAssoForm />
            
        </div>
        
    )
}