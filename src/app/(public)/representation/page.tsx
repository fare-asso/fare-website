import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import logoBTC from "#public/elues/logo-Bouge-Ton-Crous.png"
import logoCrous from "#public/Logo_Crous_vectorisé.png"
import logoFage from "#public/Logo_FAGE.png"
import logoUR2 from "#public/univ/Logo_univ-rennes2-2016.png"
import logoUR from "#public/univ/UNIRENNES_LOGOnoir_centre_RVB.png"

export const metadata: Metadata = {
    title: "Représentation"
}

export default function Representation() {
    return (
        <div className="flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-10 text-center text-4xl font-bold sm:py-16">
                Représentations
            </h1>
            <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-12 md:flex-row md:gap-20">
                <Link
                    href="/representation/fage"
                    className="group flex h-64 w-full max-w-sm flex-row items-center justify-center gap-4 rounded-2xl border-1 border-neutral-800/30 p-6 transition-all hover:bg-black/[0.04] md:h-72"
                >
                    <span className="text-3xl font-bold md:text-4xl">LA</span>
                    <Image
                        src={logoFage}
                        alt="Logo de la FAGE"
                        className="h-32 w-auto object-contain"
                        placeholder="empty"
                    />
                </Link>

                <Link
                    href="/representation/nos-elues"
                    className="group flex h-64 w-full max-w-sm flex-col items-center justify-center gap-4 rounded-2xl border-1 border-neutral-800/30 p-6 transition-all hover:bg-black/[0.04] md:h-72"
                >
                    <div className="flex items-center gap-3">
                        <Image
                            src={logoBTC}
                            alt="Logo Bouge Ton Crous"
                            className="h-16 w-16 object-contain"
                        />
                        <Image
                            src={logoCrous}
                            alt="Logo les Crous"
                            className="h-16 w-16 object-contain"
                        />
                        <Image
                            src={logoUR}
                            alt="Logo Université de Rennes"
                            className="h-16 w-16 object-contain"
                        />
                        <Image
                            src={logoUR2}
                            alt="Logo Université Rennes 2"
                            className="h-16 w-16 object-contain"
                        />
                    </div>
                    <span className="text-3xl font-bold md:text-4xl">
                        Nos éluEs
                    </span>
                </Link>
            </div>
        </div>
    )
}
