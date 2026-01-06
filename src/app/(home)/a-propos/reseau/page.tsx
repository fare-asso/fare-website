import type { Metadata } from "next"
import Link from "next/link"
import AssociationList from "@/components/public/associations/associationList"
import AssociationMapCaller from "@/components/public/associations/map/associationMapCaller"
import prisma from "@/helpers/db"

export const metadata: Metadata = {
    title: "Réseau",
    description: "Page des associations du réseau FARE"
}

export default async function Reseau() {
    const assos = await prisma.association.findMany({
        orderBy: {
            name: "asc"
        }
    })

    return (
        <div className="flex w-full flex-col items-center justify-start pb-20">
            <h1 className="py-12 font-semibold text-[3rem] sm:py-24 md:py-32 lg:py-44">
                Le Réseau Associatif
            </h1>
            <AssociationMapCaller associations={assos} />
            <AssociationList associations={assos} />

            {/* Nous rejoindre card */}
            <div className="flex w-full flex-col rounded-xl bg-black p-8 text-white md:w-1/2">
                <h2 className="mb-2 font-semibold text-lg">
                    Votre association souhaite intégrer notre réseau ?{" "}
                </h2>
                <p>
                    La FARE accueille de nouveaux membres partageant nos
                    objectifs pour la vie étudiante. En nous rejoignant, vous
                    aurez accès à notre réseau, nos ressources et notre soutien.
                    <br />
                    Pour plus d'informations sur l'adhésion, cliquez ci-dessous.
                </p>
                <Link
                    href="/adhesion"
                    className="mt-4 ml-auto w-full rounded-full border-white bg-white px-4 py-2 text-center font-semibold text-black transition-all hover:scale-105 md:w-1/3"
                >
                    Nous rejoindre
                </Link>
            </div>
        </div>
    )
}
