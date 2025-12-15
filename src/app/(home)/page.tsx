import { YouTubeEmbed } from "@next/third-parties/google"
import type { Metadata } from "next"
import Image from "next/image"
import { Suspense } from "react"
import AssoMap from "@/components/public/AssoMap"
import DiscordWidget from "@/components/public/discordWidget"
import KeyNumbers, { KeyNumbersSkeleton } from "@/components/public/keyNumbers"
import LinkButton from "@/components/public/link"
import PartnersCarousel from "@/components/public/partenariats/partnersCarousel"
import WelcomeImage from "../../../public/welcome.jpg"

import "./page.css"

export const metadata: Metadata = {
    title: "Accueil"
}

export default function Home() {
    return (
        <div className="flex w-full flex-col items-center md:w-[90%]">
            <section className="hero gap-6">
                {/* Welcome picture */}
                <Image
                    src={WelcomeImage}
                    alt="Image des membres du bureau"
                    className="w-full rounded-xl"
                    priority={true}
                    placeholder="blur"
                />

                <Suspense fallback={<KeyNumbersSkeleton />}>
                    <KeyNumbers />
                </Suspense>

                {/* Qui sommes-nous ? */}
                <div className="intro flex w-full flex-col items-start justify-between rounded-xl bg-black p-8 text-lg text-white">
                    <h2 className="mb-2 font-semibold text-2xl">
                        Qui sommes-nous ?
                    </h2>
                    <p className="text-justify">
                        La Fédération des Associations du Réseau Étudiant de
                        Haute-Bretagne (FARE) est une organisation humaniste et
                        militante qui représente les étudiant.e.s
                        d'Ille-et-Vilaine et des Côtes-d'Armor. Indépendante de
                        tout parti politique, elle œuvre chaque jour pour
                        améliorer la vie des 88 000 étudiant.e.s du territoire
                        grâce à des projets construits "par et pour les
                        étudiant.e.s".
                    </p>
                    <div className="flex w-full flex-col items-center pt-4">
                        <LinkButton
                            href="/a-propos"
                            title="En savoir +"
                            className="bg-white text-black"
                            variant="outline"
                        />
                    </div>
                </div>
            </section>

            {/* Last articles
      <div className="my-10 w-full flex flex-col">
        <h2 className="text-2xl font-semibold mb-2">
          Actualités
        </h2>
        <div className="w-full flex flex-row space-x-2">
          <div className="rounded-xl h-32 w-24 bg-gray-600">

          </div>
          <div className="rounded-xl h-32 w-24 bg-gray-600">

          </div>
        </div>

      </div> */}

            {/* Le réseau */}
            <div className="my-10 flex w-full flex-col">
                <h2 className="mb-2 font-semibold text-2xl">Notre réseau</h2>
                <Suspense fallback="Loading...">
                    <AssoMap />
                </Suspense>
            </div>

            {/* Les évènements à venir
      <div className="my-10 w-full flex flex-col">
        <h2 className="text-2xl font-semibold mb-2">
          Les évènements à venir
        </h2>
        <div className="w-full flex flex-row space-x-2">

        </div>

      </div> */}

            {/* Discord */}
            <div className="my-10 flex w-full flex-col">
                <h2 className="mb-2 font-semibold text-2xl">Discord</h2>
                <p className="mb-12 text-justify">
                    Intéressé·e par la FARE et son réseau ? Étudiant·e en
                    Ille-et-Vilaine ou Côtes-d'Armor ? La FARE possède un
                    serveur Discord, conçu par les étudiant·e·s à destination
                    des étudiant·e·s. C'est une plateforme d'échange, de partage
                    et de travail sur laquelle sont déjà présent·e·s les
                    administrateur·rice·s, les élu·e·s de la FARE mais aussi les
                    membres d'association étudiante de Haute-Bretagne. Ce
                    serveur est un réel outil pour vous et vous permet de
                    profiter au mieux des services que nous vous proposons.
                    Maintenant que c'est clair, il ne vous reste plus qu'à
                    cliquer sur le lien d'accès, et si quelques zones de flou
                    persistent, voici une vidéo de présentation du Discord de la
                    FARE qui devrait vous aider !
                </p>
                <div className="flex flex-col items-center justify-center space-y-6 md:flex-row md:space-x-12">
                    <DiscordWidget />
                    <div className="mt-4 flex w-full flex-col items-center md:w-1/2">
                        <p className="mb-2 text-center font-semibold text-lg">
                            Vidéo de présentation du&nbsp;
                            <a
                                href="https://discord.gg/4CmJ5Pa3"
                                title="Lien vers Discord"
                                className="text-blue-600 transition-all hover:text-blue-400"
                            >
                                Discord
                            </a>
                            &nbsp;de la FARE 👇
                        </p>
                        <div className="aspect-video h-full w-full rounded-md">
                            <YouTubeEmbed
                                videoid="_nu4cbdJ8do"
                                style="width: 100%; height: 100%; border-radius: 0.5rem;"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Nos partenaires */}
            <div className="my-10 flex w-full flex-col">
                <h2 className="mb-2 font-semibold text-2xl">Nos partenaires</h2>
                <PartnersCarousel />
            </div>

            {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/_nu4cbdJ8do?si=_OAfgGASwAr1jEg5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> */}
        </div>
    )
}
