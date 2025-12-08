import AdhesionDescription from "@/components/public/adhesion/adhesionDescription"
import AdhesionForm from "@/components/public/adhesion/form"

export default async function Adhesion() {
    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-12 text-[3rem] font-semibold sm:py-24 md:py-32 lg:py-44">
                Rejoindre la FARE
            </h1>
            <AdhesionDescription />
            <AdhesionForm />
        </div>
    )
}
