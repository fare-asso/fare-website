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
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Représentation
            </h1>

            <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-12 md:flex-row md:gap-20">
                <Link
                    href="/representation/fage"
                    className="group relative flex h-64 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border-2 border-black bg-white shadow-sm transition-all hover:shadow-lg md:h-72"
                >
                    <Image
                        src={logoFage}
                        alt="Logo de la FAGE"
                        className="absolute top-4 left-1/2 w-32 -translate-x-1/2 -translate-y-full object-contain opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100"
                        placeholder="empty"
                    />
                    <span className="text-3xl font-bold text-black md:text-4xl">
                        La FAGE
                    </span>
                </Link>

                <Link
                    href="/representation/nos-elues"
                    className="group relative flex h-64 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border-2 border-black bg-white shadow-sm transition-all hover:shadow-lg md:h-72"
                >
                    <Image
                        src={logoBTC}
                        alt="Logo Bouge Ton Crous"
                        className="absolute top-1 left-1 h-25 w-25 scale-0 object-contain opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100"
                    />
                    <Image
                        src={logoCrous}
                        alt="Logo les Crous"
                        className="absolute top-3 right-3 h-20 w-20 scale-0 object-contain opacity-0 transition-all delay-75 duration-500 ease-out group-hover:scale-100 group-hover:opacity-100"
                    />
                    <Image
                        src={logoUR}
                        alt="Logo Université de Rennes"
                        className="absolute bottom-3 left-3 h-20 w-20 scale-0 object-contain opacity-0 transition-all delay-150 duration-500 ease-out group-hover:scale-100 group-hover:opacity-100"
                    />
                    <Image
                        src={logoUR2}
                        alt="Logo Université Rennes 2"
                        className="absolute right-3 bottom-3 h-20 w-20 scale-0 object-contain opacity-0 transition-all delay-200 duration-500 ease-out group-hover:scale-100 group-hover:opacity-100"
                    />
                    <span className="text-3xl font-bold text-black md:text-4xl">
                        Nos éluEs
                    </span>
                </Link>
            </div>
        </div>
    )
}
