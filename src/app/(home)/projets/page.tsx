import Image from "next/image"
import Link from "next/link"
import logoAgoraE from "#public/AGORAe/logo_AgoraE.png"
import logoBTP from "#public/BTP/LOGO_BTP_2024.webp"
import logoBA from "#public/logoBagadAsso.png"

export default function Projets() {
    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center font-bold text-4xl sm:py-24">
                Projets
            </h1>

            <div className="flex w-3/4 flex-col items-center justify-center space-y-8 md:flex-row md:space-x-20 md:space-y-0">
                <Link
                    href="/agorae"
                    className="flex flex-col items-center transition-all hover:scale-105"
                >
                    <Image
                        src={logoAgoraE}
                        alt="Logo de l'AGORAé"
                        className="aspect-square h-auto w-52 object-contain"
                    />
                    <h2 className="text-center">Projet AGORAé</h2>
                </Link>

                <Link
                    href="/bouge-ta-prison"
                    className="flex flex-col items-center transition-all hover:scale-105"
                >
                    <Image
                        src={logoBTP}
                        alt="Logo du projet Bouge Ta Prison"
                        className="aspect-square h-auto w-52 object-contain"
                    />
                    <h2 className="text-center">Projet Bouge Ta Prison</h2>
                </Link>

                <Link
                    href="/bagadAsso"
                    className="flex flex-col items-center p-4 transition-all hover:scale-105"
                >
                    <Image
                        src={logoBA}
                        alt="Logo du projet Bagad'Asso"
                        className="aspect-square h-auto w-52 object-contain"
                    />
                    <h2 className="text-center">Projet Bagad'Asso</h2>
                </Link>
            </div>
        </div>
    )
}
