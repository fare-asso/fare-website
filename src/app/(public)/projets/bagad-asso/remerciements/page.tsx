import type { Metadata } from "next"
import Image from "next/image"

import logoBagadAsso from "#public/Logo_Bagadasso.png"
import logoUnivRennes2 from "#public/univ/Logo_univ-rennes2-2016.png"
import logoUnivRennes from "#public/univ/UNIRENNES_LOGOnoir_centre_RVB.png"

export const metadata: Metadata = {
    title: "Remerciements"
}

const financeurs = [
    {
        name: "Université de Rennes",
        logo: logoUnivRennes,
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
        name: "Université Rennes 2",
        logo: logoUnivRennes2,
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
]

export default function RemerciementsBagadAsso() {
    return (
        <div className="flex w-full flex-col items-center justify-start">
            <Image
                src={logoBagadAsso}
                alt="Logo du projet Bagad'Asso"
                className="mb-12 w-72"
            />

            <section className="mb-12 w-full max-w-4xl">
                <h1 className="mb-4 text-3xl font-bold">Remerciements</h1>
                <p className="mb-4 text-justify">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                </p>
                <p className="text-justify">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                </p>
            </section>

            <section className="mb-12 w-full max-w-4xl">
                <h2 className="mb-6 text-2xl font-bold">Nos financeurs</h2>
                <div className="flex flex-col gap-8">
                    {financeurs.map((financeur) => (
                        <div
                            key={financeur.name}
                            className="flex flex-col items-center gap-6 rounded-xl border bg-white p-8 md:flex-row"
                        >
                            <div className="flex w-full shrink-0 items-center justify-center md:w-56">
                                <Image
                                    src={financeur.logo}
                                    alt={`Logo de ${financeur.name}`}
                                    className="h-24 w-auto object-contain"
                                />
                            </div>
                            <div>
                                <h3 className="mb-2 text-xl font-semibold">
                                    {financeur.name}
                                </h3>
                                <p className="text-justify">
                                    {financeur.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
