import type { Metadata } from "next"
import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import { tryCatch } from "@/lib/utils"

export const metadata: Metadata = {
    title: "Élus"
}

type EluView = {
    name: string
    position: string
    description?: string | null
}

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

export default async function Elues(): Promise<React.JSX.Element> {
    const supabase = await createClient()

    const result = await tryCatch(
        prisma.instance.findMany({
            include: {
                conseils: {
                    orderBy: { order: "asc" },
                    include: { elus: { orderBy: { order: "asc" } } }
                }
            },
            orderBy: { order: "asc" }
        })
    )

    const instances = (result.success ? result.value : []).map((instance) => ({
        ...instance,
        logoUrl: instance.logoPath
            ? supabase.storage
                  .from("instance-pictures")
                  .getPublicUrl(instance.logoPath).data.publicUrl
            : null
    }))

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
                                {instance.logoUrl ? (
                                    <div className="mt-20 flex w-full flex-row items-center justify-center space-x-6">
                                        <Image
                                            src={instance.logoUrl}
                                            width={220}
                                            height={220}
                                            alt={`Logo de ${instance.name}`}
                                            className="h-auto w-32 object-contain md:h-44 md:w-auto"
                                        />
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
