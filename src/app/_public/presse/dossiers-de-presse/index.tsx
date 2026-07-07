import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import DossierDePresseCard from "@/components/public/presse/ddpCard"
import prisma from "@/helpers/db.server"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getDossiers = createServerFn().handler(async () => {
    const result = await tryCatch(
        prisma.communiqueDePresse.findMany({
            where: {
                type: "DDP"
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    )
    return result.success ? result.value : null
})

export const Route = createFileRoute("/_public/presse/dossiers-de-presse/")({
    loader: async () => ({ dossiers: await getDossiers() }),
    head: () => ({ meta: [{ title: pageTitle("Dossiers de presse") }] }),
    component: DossiersDePresse
})

function DossiersDePresse() {
    const { dossiers } = Route.useLoaderData()

    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Dossiers de presse
            </h1>

            <div className="flex w-3/4 flex-col items-center space-y-2">
                {dossiers === null ? (
                    <p className="text-destructive text-lg font-medium">
                        Echec du chargement des dossiers de presse
                    </p>
                ) : dossiers.length > 0 ? (
                    dossiers.map((dossier) => (
                        <DossierDePresseCard
                            key={dossier.id}
                            dossier={dossier}
                        />
                    ))
                ) : (
                    <span className="text-xl">
                        Nous n'avons pas encore de dossiers de presse.🥲
                    </span>
                )}
            </div>
        </div>
    )
}
