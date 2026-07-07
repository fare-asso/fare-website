import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import CommuniquesCard from "@/components/public/presse/cdpCard"
import prisma from "@/helpers/db.server"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getCommuniques = createServerFn().handler(async () => {
    const result = await tryCatch(
        prisma.communiqueDePresse.findMany({
            where: {
                type: "CDP"
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    )
    return result.success ? result.value : null
})

export const Route = createFileRoute("/_public/presse/communiques-de-presse/")({
    loader: async () => ({ communiques: await getCommuniques() }),
    head: () => ({ meta: [{ title: pageTitle("Communiqués de presse") }] }),
    component: CommuniquesDePresse
})

function CommuniquesDePresse() {
    const { communiques } = Route.useLoaderData()

    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Communiqués de presse
            </h1>

            <div className="flex w-3/4 flex-col items-center space-y-2">
                {communiques === null ? (
                    <p className="text-destructive text-lg font-medium">
                        Echec du chargement des communiqués de presse
                    </p>
                ) : communiques.length > 0 ? (
                    communiques.map((cdp) => (
                        <CommuniquesCard key={cdp.id} communique={cdp} />
                    ))
                ) : (
                    <span className="text-xl">
                        Nous n'avons pas encore de communiqués de presse.🥲
                    </span>
                )}
            </div>
        </div>
    )
}
