import AdhesionForm from "@/components/public/adhesion/form";


export default async function Adhesion() {

    return(
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-12 sm:py-24 md:py-32 lg:py-44 text-[3rem] font-semibold">{"Rejoindre la FAHB"}</h1>
            <AdhesionForm />
        </div>
        
    )
}