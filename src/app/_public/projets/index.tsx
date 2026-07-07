import { createFileRoute } from "@tanstack/react-router"

import Image from "@/components/image"
import Link from "@/components/link"
import { pageTitle } from "@/lib/seo"

export const Route = createFileRoute("/_public/projets/")({
    head: () => ({ meta: [{ title: pageTitle("Projets") }] }),
    component: Projets
})

function Projets() {
    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Projets
            </h1>

            <div className="flex w-3/4 flex-col items-center justify-center space-y-8 md:flex-row md:space-y-0 md:space-x-20">
                <Link
                    href="/projets/agorae"
                    className="flex flex-col items-center transition-all hover:scale-105"
                >
                    <Image
                        src="/AGORAe/logo_AgoraE.png"
                        alt="Logo de l'AGORAé"
                        className="aspect-square h-auto w-52 object-contain"
                    />
                    <h2 className="text-center">Projet AGORAé</h2>
                </Link>

                <Link
                    href="/projets/bouge-ta-prison"
                    className="flex flex-col items-center transition-all hover:scale-105"
                >
                    <Image
                        src="/BTP/Logo_BTP.png"
                        alt="Logo du projet Bouge Ta Prison"
                        className="aspect-square h-auto w-52 object-contain"
                    />
                    <h2 className="text-center">Projet Bouge Ta Prison</h2>
                </Link>

                <Link
                    href="/projets/bagad-asso"
                    className="flex flex-col items-center p-4 transition-all hover:scale-105"
                >
                    <Image
                        src="/Logo_Bagadasso.png"
                        alt="Logo du projet Bagad'Asso"
                        className="aspect-square h-auto w-52 object-contain"
                    />
                    <h2 className="text-center">Projet Bagad'Asso</h2>
                </Link>
            </div>
        </div>
    )
}
