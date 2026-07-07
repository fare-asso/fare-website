import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import Image from "@/components/image"
import { Card, CardContent } from "@/components/ui/card"
import prisma from "@/helpers/db.server"
import { createClient } from "@/helpers/supabase.server"
import { captureActionError } from "@/lib/sentry"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

type EluView = {
    name: string
    position: string
    description?: string | null
}

const getInstances = createServerFn().handler(async () => {
    const supabase = createClient()

    const result = await tryCatch(
        prisma.instance.findMany({
            include: {
                conseils: {
                    orderBy: { order: "asc" },
                    include: {
                        elus: {
                            where: { deletedAt: null },
                            orderBy: { order: "asc" }
                        }
                    }
                }
            },
            orderBy: { order: "asc" }
        })
    )

    if (!result.success) {
        captureActionError(result.error)
    }

    return (result.success ? result.value : []).map((instance) => ({
        ...instance,
        logoUrls: instance.logoPaths.map(
            (path) =>
                supabase.storage.from("instance-pictures").getPublicUrl(path)
                    .data.publicUrl
        )
    }))
})

export const Route = createFileRoute("/_public/representation/nos-elues/")({
    loader: async () => ({ instances: await getInstances() }),
    head: () => ({ meta: [{ title: pageTitle("Élus") }] }),
    component: Elues
})

const EluCard = ({ elu }: { elu: EluView }) => {
    return (
        <Card className="w-full">
            <CardContent className="space-y-4 p-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">{elu.name}</h3>
                    <p className="text-sm text-gray-600">{elu.position}</p>
                    {elu.description ? (
                        <p className="text-sm text-gray-500">
                            {elu.description}
                        </p>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    )
}

function Elues() {
    const { instances } = Route.useLoaderData()

    return (
        <div className="flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Nos élu·e·s étudiant·e·s de la FARE
            </h1>

            <div className="mb-20 w-full max-w-4xl space-y-12">
                <div className="prose mb-20 max-w-none rounded-lg bg-black p-6 text-white">
                    <p className="text-justify">
                        La FARE a parmi ses missions principales de représenter
                        l'ensemble des étudiant.e.s de Haute-Bretagne. Pour ce
                        faire, notre fédération se mobilise au quotidien par des
                        élu.e.s, étudiant.e.s engagé.e.s au sein de la FARE, qui
                        ont pour rôle de siéger dans différents conseils.
                    </p>
                </div>

                {instances.length === 0 ? (
                    <p className="text-muted-foreground text-center">
                        Aucun·e élu·e à afficher pour le moment.
                    </p>
                ) : (
                    instances.map((instance) => (
                        <section key={instance.id} className="space-y-6">
                            <div className="flex flex-col items-center space-y-6">
                                {instance.logoUrls.length > 0 ? (
                                    <div className="mt-20 flex w-full flex-row flex-wrap items-center justify-center gap-6">
                                        {instance.logoUrls.map((url, index) => (
                                            <Image
                                                key={url}
                                                src={url}
                                                width={220}
                                                height={220}
                                                alt={`Logo ${index + 1} de ${instance.name}`}
                                                className="h-auto w-32 object-contain md:h-44 md:w-auto"
                                            />
                                        ))}
                                    </div>
                                ) : null}

                                <h2 className="mb-4 text-2xl font-semibold">
                                    {instance.name}
                                </h2>
                                <p className="py-3 text-sm font-medium">
                                    Contact : {instance.contactEmail}
                                </p>
                            </div>

                            {instance.description ? (
                                <div className="prose mb-4 max-w-none">
                                    <p className="text-justify">
                                        {instance.description}
                                    </p>
                                </div>
                            ) : null}

                            {instance.conseils.map((conseil) => (
                                <div key={conseil.id} className="space-y-4">
                                    <div className="prose mb-4 max-w-none">
                                        <h3 className="mb-4 text-xl font-semibold">
                                            {conseil.name}
                                        </h3>
                                        {conseil.description ? (
                                            <p className="text-justify">
                                                {conseil.description}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {conseil.elus.map((elu) => (
                                            <EluCard key={elu.id} elu={elu} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </section>
                    ))
                )}
            </div>
        </div>
    )
}
