import type { Metadata } from "next"
import AdhesionDescription from "@/components/public/adhesion/adhesionDescription"
import AdhesionForm from "@/components/public/adhesion/form"
import { AdhesionFormNew } from "./form"

export const metadata: Metadata = {
    title: "Formulaire d'adhésion"
}

export default function Adhesion() {
    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-12 font-semibold text-[3rem] sm:py-24 md:py-32 lg:py-44">
                Rejoindre la FARE
            </h1>
            <AdhesionDescription />
            <AdhesionFormNew />
            <AdhesionForm />
        </div>
    )
}
