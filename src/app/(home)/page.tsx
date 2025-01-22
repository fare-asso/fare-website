import Image from "next/image";
import { Metadata } from "next";
import DiscordWidget from "@/components/public/discordWidget";

import WelcomeImage from "../../../public/welcome.jpg";
import FAHBLogo from "../../../public/FAHB_Logo__Nom.png";

import Link from "next/link";
import LinkButton from "@/components/public/link";
import AssociationMapCaller from "@/components/public/associations/map/associationMapCaller";
import prisma from "@/helpers/db";
import { Association } from "@prisma/client";
import AnimatedNumber from "@/components/ui/animatedNumber";
import PartnersCarousel from "@/components/public/partenariats/partnersCarousel";

export const metadata: Metadata = {
    title: "Accueil | FAHB",
};

export default async function Home() {
    let associations: Association[] | undefined;

    try {
        associations = await prisma.association.findMany();
    } catch (e) {
        console.error("Failed to fetch associations");
    }

    return (
        <div className="w-full md:w-[90%] flex flex-col items-center">
            {/* Welcome picture */}
            <div className="w-full md:w-1/2 mb-8">
                <Image
                    src={WelcomeImage}
                    alt="Image des membres du bureau"
                    className="w-full rounded-xl"
                />
            </div>

            {/* Key numbers */}
            <div className="w-full md:w-2/3 flex flex-col md:flex-row items-center justify-center mt-2 md:mt-0 md:ml-4 [&>div]:h-32 space-y-2 md:space-y-0 space-x-0 md:space-x-2">
                <div className="rounded-xl bg-fahbyellow flex flex-col items-center justify-center p-4 md:p-2 h-full w-full md:w-1/3">
                    <span className="text-2xl md:text-[2.5rem] font-semibold text-white">
                        <AnimatedNumber
                            end={associations ? associations.length : 20}
                            duration={1.5}
                        />
                    </span>
                    <span className="text-xl md:p-1 opacity-95 text-center text-white">
                        Associations étudiantes
                    </span>
                </div>

                <div className="rounded-xl bg-fahbyellow flex flex-col items-center justify-center p-4 md:p-2 h-full w-full md:w-1/3">
                    <span className="text-2xl md:text-[2.5rem] font-semibold text-white">
                        <AnimatedNumber end={88000} duration={3} />
                    </span>
                    <span className="text-xl md:p-1 opacity-95 text-center text-white">
                        Étudiant.e.s
                    </span>
                </div>

                <div className="rounded-xl bg-fahbyellow flex flex-col items-center justify-center p-4 md:p-2 h-full w-full md:w-1/3">
                    <span className="text-2xl md:text-[2.5rem] font-semibold text-white">
                        <AnimatedNumber end={28} duration={4} />
                    </span>
                    <span className="text-xl md:p-1 opacity-95 text-center text-white">
                        Élu.e.s universitaires & CROUS
                    </span>
                </div>
            </div>

            {/* Qui sommes-nous ? */}
            <div className="my-10 w-full flex flex-col items-center">
                <div className="w-full md:w-[80%] rounded-xl flex flex-col items-start justify-between px-12 py-8 bg-black text-lg text-white">
                    <h2 className="text-2xl mb-2 font-semibold">
                        Qui sommes-nous ?
                    </h2>
                    <p className="text-justify">
                        La Fédération des Associations de Haute-Bretagne (FAHB)
                        est une organisation humaniste et militante qui
                        représente les étudiant.e.s d'Ille-et-Vilaine et des
                        Côtes d'Armor. Indépendante de tout parti politique,
                        elle œuvre chaque jour pour améliorer la vie des 88 000
                        étudiant.e.s du territoire grâce à des projets
                        construits "par et pour les étudiant.e.s".
                    </p>
                    <div className="w-full flex items-center flex-col pt-8">
                        <LinkButton
                            href="/a-propos"
                            title="En savoir +"
                            className="bg-white text-black"
                        />
                    </div>
                </div>
            </div>

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
            <div className="my-10 w-full flex flex-col">
                <h2 className="text-2xl font-semibold mb-2">Notre réseau</h2>
                <div className="flex flex-col items-center">
                    {associations ? (
                        <AssociationMapCaller associations={associations} />
                    ) : (
                        <span>Echec de la récupération des associations</span>
                    )}
                </div>
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
            <div className="my-10 w-full flex flex-col">
                <h2 className="text-2xl font-semibold mb-2">Discord</h2>
                <p className="text-justify mb-12">
                    Intéressé·e par la FAHB et son réseau ? Étudiant·e en
                    Ille-et-Vilaine ou Côtes d'Armor ? La FAHB possède un
                    serveur Discord, conçu par les étudiant·e·s à destination
                    des étudiant·e·s. C'est une plateforme d'échange, de partage
                    et de travail sur laquelle sont déjà présent·e·s les
                    administrateur·rice·s, les élu·e·s de la FAHB mais aussi
                    tous·tes les membres des associations étudiantes de
                    Haute-Bretagne. Ce serveur est un réel outil pour vous et
                    vous permet de profiter au mieux des services que nous vous
                    proposons. Maintenant que c'est clair, il ne vous reste plus
                    qu'à cliquer sur le lien d'accès, et si quelques zones de
                    flou persistent, voici une vidéo de présentation du Discord
                    de la FAHB qui devrait vous aider !
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-x-12">
                    <DiscordWidget />
                    <div className="flex flex-col w-full md:w-1/2 items-center mt-4">
                        <p className="text-lg font-semibold mb-2 text-center">
                            Vidéo de présentation du&nbsp;
                            <a
                                href="https://discord.gg/VNK9GcheFr"
                                title="Lien vers Discord"
                                className="text-blue-600 hover:text-blue-400 transition-all"
                            >
                                Discord
                            </a>
                            &nbsp;de la FAHB 👇
                        </p>
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube-nocookie.com/embed/_nu4cbdJ8do?si=o2KlDcO3qnKorlsh"
                            title="Vidéo Discord"
                            frameBorder="0"
                            allow="web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            className="rounded-md w-full h-full aspect-video"
                        ></iframe>
                    </div>
                </div>
            </div>

            {/* Nos partenaires */}
            <div className="my-10 w-full flex flex-col">
                <h2 className="text-2xl font-semibold mb-2">Nos partenaires</h2>
                <PartnersCarousel />
            </div>

            {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/_nu4cbdJ8do?si=_OAfgGASwAr1jEg5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> */}
        </div>
    );
}
