import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import gifElues from "#public/elues/elues.gif"
import logoFage from "#public/Logo_FAGE.png"

export const metadata: Metadata = {
    title: "Représentation"
}

export default function Representation() {
    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Représentation
            </h1>

            <div className="flex w-3/4 flex-col items-center justify-center space-y-8 md:flex-row md:space-y-0 md:space-x-20">
                <Link
                    href="/representation/fage"
                    className="flex flex-col items-center transition-all hover:scale-105"
                >
                    <Image
                        src={logoFage}
                        alt="Logo de la FAGE"
                        className="aspect-square h-auto w-52 object-contain"
                        placeholder="empty"
                    />
                    <h2 className="text-center">La FAGE</h2>
                </Link>

                <Link
                    href="/representation/nos-elues"
                    className="flex flex-col items-center transition-all hover:scale-105"
                >
                    <Image
                        src={gifElues}
                        alt="Logo des élues"
                        className="aspect-square h-auto w-52 object-contain"
                    />
                    {/* TODO: ajout de l'écriture inclusive */}
                    <h2 className="text-center">Nos élues</h2>
                </Link>
            </div>
        </div>
    )
}
