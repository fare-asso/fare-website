import Link from "next/link";
import Image from "next/image";

export default function Representation() {
    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Représentation
            </h1>

            <div className="flex w-3/4 flex-col items-center justify-center space-y-8 md:flex-row md:space-x-20">
                <Link
                    href="/bouge-ta-prison"
                    className="flex flex-col items-center transition-all hover:scale-105"
                >
                    {/* <Image
                        src={logoBTP}
                        alt="Logo du projet Bouge Ta Prison"
                        className="w-52 h-auto aspect-square object-contain"
                    /> */}
                    <h2>La FAGE</h2>
                </Link>

                <Link
                    href="/bagadAsso"
                    className="flex flex-col items-center transition-all hover:scale-105"
                >
                    {/* <Image
                        src={logoBA}
                        alt="Logo du projet Bagad'Asso"
                        className="w-52 h-auto aspect-square object-contain"
                    /> */}
                    {/* TODO: ajout de l'écriture inclusive */}
                    <h2>Nos élues</h2>
                </Link>
            </div>
        </div>
    );
}
