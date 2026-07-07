import { Await, createFileRoute, Link } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { Image } from "@unpic/react"

import WelcomeImage from "#public/hero-image.jpg"
import AssoMap from "@/components/public/AssoMap"
import DiscordWidget from "@/components/public/discordWidget"
import KeyNumbers, { KeyNumbersSkeleton } from "@/components/public/keyNumbers"
import LinkButton from "@/components/public/link"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

import homeCss from "@/styles/home.css?url"

const getPartners = createServerFn().handler(async () => {
    const supabase = createClient()
    const partenaires = await tryCatch(
        prisma.partenaire.findMany({ orderBy: { name: "asc" } })
    )
    if (!partenaires.success) return null
    return partenaires.value.map((p) => ({
        id: p.id,
        name: p.name,
        logoUrl: supabase.storage
            .from("partner-pictures")
            .getPublicUrl(p.logoPath).data.publicUrl
    }))
})

const getAssociationCount = createServerFn().handler(async () => {
    const result = await tryCatch(prisma.association.count())
    return result.success ? result.value : undefined
})

const getMapAssociations = createServerFn().handler(async () => {
    const result = await tryCatch(
        prisma.association.findMany({ where: { approved: { not: null } } })
    )
    return result.success ? result.value : undefined
})

export const Route = createFileRoute("/_public/")({
    loader: async () => ({
        partners: await getPartners(),
        associationCount: getAssociationCount(),
        mapAssociations: getMapAssociations()
    }),
    head: () => ({
        meta: [{ title: pageTitle("Accueil") }],
        links: [{ rel: "stylesheet", href: homeCss }]
    }),
    component: Home
})

function Home() {
    const { partners, associationCount, mapAssociations } =
        Route.useLoaderData()

    if (!partners) {
        return (
            <div className="flex w-full flex-col items-center justify-center py-32">
                <p className="text-destructive text-lg font-medium">
                    Echec du chargement des partenaires
                </p>
            </div>
        )
    }

    return (
        <div className="flex w-full flex-col items-center md:w-[90%]">
            <section className="hero gap-4 md:gap-6">
                <Image
                    src={WelcomeImage}
                    alt="Image des membres du bureau"
                    className="w-full rounded-xl"
                    priority={true}
                    layout="constrained"
                    width={1200}
                    height={800}
                />

                <Await
                    promise={associationCount}
                    fallback={<KeyNumbersSkeleton />}
                >
                    {(count) => <KeyNumbers associationCount={count} />}
                </Await>

                {/* Qui sommes-nous ? */}
                <div className="intro flex w-full flex-col items-start justify-between rounded-xl bg-black p-8 text-lg text-white">
                    <h2 className="mb-2 text-2xl font-semibold">
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

            {/* Le réseau */}
            <div className="my-10 flex w-full flex-col">
                <h2 className="mb-2 text-2xl font-semibold">Notre réseau</h2>
                <Await promise={mapAssociations} fallback="Loading...">
                    {(associations) => <AssoMap associations={associations} />}
                </Await>
            </div>

            {/* Discord */}
            <div className="my-10 flex w-full flex-col">
                <h2 className="mb-2 text-2xl font-semibold">Discord</h2>
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
                        <p className="mb-2 text-center text-lg font-semibold">
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
                            <iframe
                                src="https://www.youtube-nocookie.com/embed/_nu4cbdJ8do"
                                title="Vidéo de présentation du Discord de la FARE"
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="h-full w-full rounded-lg border-0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Nos partenaires */}
            {partners.length > 0 && (
                <div className="my-10 flex w-full flex-col items-center">
                    <h2 className="mb-8 text-3xl font-semibold">
                        Nos partenaires
                    </h2>
                    <div className="flex flex-row flex-wrap items-center justify-center gap-8">
                        {partners.map((partner) => (
                            <Link
                                key={partner.id}
                                to="/a-propos/partenaires"
                                className="flex h-24 w-60 items-center justify-center"
                            >
                                <Image
                                    key={partner.id}
                                    src={partner.logoUrl}
                                    alt={"Logo de " + partner.name}
                                    width={160}
                                    height={80}
                                    className="h-full w-full object-contain"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
