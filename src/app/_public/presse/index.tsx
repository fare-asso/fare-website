import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import CommuniquesCard from "@/components/public/presse/cdpCard"
import DossierDePresseCard from "@/components/public/presse/ddpCard"
import prisma from "@/helpers/db"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getCommuniques = createServerFn().handler(async () => {
    const result = await tryCatch(
        prisma.communiqueDePresse.findMany({
            orderBy: {
                createdAt: "desc"
            }
        })
    )
    return result.success ? result.value : null
})

export const Route = createFileRoute("/_public/presse/")({
    loader: async () => ({ communiques: await getCommuniques() }),
    head: () => ({ meta: [{ title: pageTitle("Presse") }] }),
    component: Presse
})

function Presse() {
    const { communiques } = Route.useLoaderData()

    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Documents de presse
            </h1>

            <div className="flex w-3/4 flex-col items-center space-y-2">
                {communiques === null ? (
                    <p className="text-destructive text-lg font-medium">
                        Echec du chargement des documents de presse
                    </p>
                ) : communiques.length > 0 ? (
                    communiques.map((cdp) =>
                        cdp.type === "CDP" ? (
                            <CommuniquesCard key={cdp.id} communique={cdp} />
                        ) : (
                            <DossierDePresseCard key={cdp.id} dossier={cdp} />
                        )
                    )
                ) : (
                    <span className="text-xl">
                        Nous n'avons pas encore de documents de presse.🥲
                    </span>
                )}
            </div>
        </div>
    )
}
