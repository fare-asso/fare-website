import type { Metadata } from "next"

import CommuniquesCard from "@/components/public/presse/cdpCard"
import DossierDePresseCard from "@/components/public/presse/ddpCard"
import prisma from "@/helpers/db"

export const metadata: Metadata = {
    title: "Presse"
}

export default async function Presse() {
    const communiques = await prisma.communiqueDePresse.findMany({
        orderBy: {
            createdAt: "desc"
        }
    })

    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Documents de presse
            </h1>

            <div className="flex w-3/4 flex-col items-center space-y-2">
                {communiques.length > 0 ? (
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
