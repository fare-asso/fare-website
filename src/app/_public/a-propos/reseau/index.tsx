import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import Link from "@/components/link"
import AssociationList from "@/components/public/associations/associationList"
import AssociationMapCaller from "@/components/public/associations/map/associationMapCaller"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getAssociations = createServerFn().handler(async () => {
    const supabase = createClient()
    const result = await tryCatch(
        prisma.association.findMany({
            where: { approved: { not: null } },
            orderBy: { name: "asc" }
        })
    )
    if (!result.success) return null
    return result.value.map((association) => ({
        ...association,
        logoUrl: supabase.storage
            .from("association-pictures")
            .getPublicUrl(association.logoPath).data.publicUrl
    }))
})

export const Route = createFileRoute("/_public/a-propos/reseau/")({
    loader: async () => ({ assos: await getAssociations() }),
    head: () => ({
        meta: [
            { title: pageTitle("Réseau") },
            {
                name: "description",
                content: "Page des associations du réseau FARE"
            }
        ]
    }),
    component: Reseau
})

function Reseau() {
    const { assos } = Route.useLoaderData()

    if (!assos) {
        return (
            <div className="flex w-full flex-col items-center justify-center py-32">
                <p className="text-destructive text-lg font-medium">
                    Echec du chargement des associations
                </p>
            </div>
        )
    }

    return (
        <div className="flex w-full flex-col items-center justify-start pb-20">
            <h1 className="py-12 text-[3rem] font-semibold sm:py-24 md:py-32 lg:py-44">
                Le Réseau Associatif
            </h1>
            <AssociationMapCaller associations={assos} />
            <AssociationList associations={assos} />

            {/* Nous rejoindre card */}
            <div className="flex w-full flex-col rounded-xl bg-black p-8 text-white md:w-1/2">
                <h2 className="mb-2 text-lg font-semibold">
                    Votre association souhaite intégrer notre réseau ?{" "}
                </h2>
                <p className="text-justify">
                    La FARE accueille de nouveaux membres partageant nos
                    objectifs pour la vie étudiante. En nous rejoignant, vous
                    aurez accès à notre réseau, nos ressources et notre soutien.
                    <br />
                    Pour plus d'informations sur l'adhésion, cliquez ci-dessous.
                </p>
                <Link
                    href="/a-propos/adhesion"
                    className="mt-4 ml-auto w-full rounded-full border-white bg-white px-4 py-2 text-center font-semibold text-black transition-all hover:scale-105 md:w-1/3"
                >
                    Nous rejoindre
                </Link>
            </div>
        </div>
    )
}
