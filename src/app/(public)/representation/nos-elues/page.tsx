import type { Metadata } from "next"
import Image from "next/image"
import { Fragment } from "react/jsx-runtime"

import logoEHESP from "#public/elues/ehesp/ehesp.png"
import logoBougeTonCampus from "#public/elues/logo-Bouge-Ton-Campus.png"
import logoBougeTonCrous from "#public/elues/logo-Bouge-Ton-Crous.png"
import logoCrous from "#public/Logo_Crous_vectorisé.png"
import logoUR2 from "#public/univ/Logo_univ-rennes2-2016.png"
import logoUR from "#public/univ/UNIRENNES_LOGOnoir_centre_RVB.png"
import { Card, CardContent } from "@/components/ui/card"

import {
    type Elu,
    useElusCROUS,
    useElusEHESP,
    useElusRennes2,
    useElusUnivRennes
} from "./data"

export const metadata: Metadata = {
    title: "Élus"
}

const EluCard = ({ elu }: { elu: Elu }) => {
    return (
        <Card className="w-full">
            <CardContent className="space-y-4 p-4">
                {/* <img
          src="/api/placeholder/200/200"
          alt={`Photo de ${elu.firstName} ${elu.lastName}`}
          className="w-full rounded-lg"
        /> */}
                <div className="space-y-2">
                    <h3 className="font-semibold">
                        {elu.firstName} {elu.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{elu.position}</p>
                    {elu.details && (
                        <p className="text-sm text-gray-500">{elu.details}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default function Elues() {
    const elusCROUS = useElusCROUS()
    const elusUnivRennes = useElusUnivRennes()
    const elusEHESP = useElusEHESP()
    const elusRennes2 = useElusRennes2()

    return (
        <div className="flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Nos élu·e·s étudiant·e·s de la FARE
            </h1>

            {/* Headers pictures */}
            {/* <div className="w-[80%] flex flex-row space-x-12 items-center justify-center mb-12">
                <Image src={logoBougeTonCrous} alt="Logo Bouge Ton Crous" className='w-44 h-auto'/>
                <Image src={logoBougeTonCampus} alt="Logo Bouge Ton Campus" className='w-44 h-auto'/>
            </div> */}

            <div className="mb-20 w-full max-w-4xl space-y-12">
                <div className="prose mb-20 max-w-none rounded-lg bg-black p-6 text-white">
                    <p className="text-justify">
                        La FARE a parmi ses missions principales de représenter
                        l'ensemble des étudiant.e.s de Haute-Bretagne. Pour ce
                        faire, notre fédération se mobilise au quotidien par des
                        élu.e.s, étudiant.e.s engagé.e.s au sein de la FARE, qui
                        ont pour rôle de siéger dans différents conseils.
                    </p>
                </div>

                {/* Elu.e.s "Bouge ton Crous" */}
                <section className="space-y-6">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="mt-20 flex w-full flex-row items-center justify-center space-x-6">
                            <Image
                                src={logoBougeTonCrous}
                                alt="Logo Bouge Ton Crous"
                                className="h-auto w-32 md:h-44 md:w-auto"
                            />
                            <Image
                                src={logoCrous}
                                alt="Logo du Crous Bretagne"
                                className="h-auto w-32 md:h-44 md:w-auto"
                            />
                        </div>

                        <h2 className="mb-4 text-2xl font-semibold">
                            Nos élu.e.s “Bouge Ton CROUS” au CROUS Bretagne
                        </h2>
                        <p className="py-3 text-sm font-medium">
                            Contact : elus.crous@fare-asso.fr
                        </p>
                    </div>

                    <div className="prose mb-4 max-w-none">
                        <p className="text-justify">
                            Le Conseil d'Administration d'un CROUS (Centre
                            Régional des Œuvres Universitaires et Scolaires) est
                            l'organe de gouvernance chargé de définir les
                            orientations stratégiques et de superviser la
                            gestion de l'établissement. Il est composé de
                            représentants de l'État, des collectivités
                            territoriales, des étudiants, du personnel, et
                            parfois de personnalités qualifiées. Ce conseil
                            prend des décisions sur le budget, la gestion des
                            services aux étudiants (bourses, logements,
                            restauration, activités culturelles), et les projets
                            de développement. Il joue un rôle clé dans
                            l'amélioration des conditions de vie et d'études des
                            étudiants dans sa région.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {elusCROUS.map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>
                </section>

                {/* Elu.e.s "Bouge ton Campus" de l'Université de Rennes */}
                <section className="space-y-6">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="mt-20 flex w-full flex-row items-center justify-center space-x-6">
                            <Image
                                src={logoBougeTonCampus}
                                alt="Logo de Bouge Ton Campus"
                                className="h-auto w-32 md:h-44 md:w-auto"
                            />
                            <Image
                                src={logoUR}
                                alt="Logo de l'Université de Rennes"
                                className="h-auto w-32 md:h-44 md:w-auto"
                            />
                        </div>

                        <h2 className="mb-4 text-2xl font-semibold">
                            Nos élu.e.s “Bouge Ton Campus” de l'Université de
                            Rennes
                        </h2>
                        <p className="py-3 text-sm font-medium">
                            Contact : btc.univrennes@fare-asso.fr
                        </p>
                    </div>

                    {/* VPE */}
                    <div className="prose mb-4 max-w-none">
                        <h3 className="mb-4 text-xl font-semibold">
                            Vice-Présidence Étudiante (VPE)
                        </h3>
                        <p className="text-justify">
                            La Vice-Présidence Étudiante (VPE) au sein des
                            instances d'une université est un.e représentant.e
                            étudiant.e, élu.e parmi les élu.e.s, pour siéger
                            dans les organes de gouvernance de l'établissement,
                            comme le CA ou le CFVE. Sa mission principale est de
                            porter la voix des étudiants, de défendre leurs
                            intérêts et d'améliorer leurs conditions d'études et
                            de vie sur le campus. Le ou la VPE participe aux
                            décisions concernant les politiques de formation, la
                            vie étudiante, les services offerts aux étudiants,
                            et les initiatives en faveur de leur bien-être et de
                            leur engagement citoyen. Le ou la VPE joue également
                            un rôle clé dans la liaison entre les associations
                            étudiantes et l'administration universitaire. Il ou
                            elle contribue à la mise en place de projets
                            favorisant l'engagement étudiant, comme des
                            événements culturels ou des initiatives de
                            solidarité. Le ou la VPE est souvent consulté.e sur
                            des questions touchant à l'égalité des chances, à
                            l'intégration des étudiants internationaux, ainsi
                            qu'à la transition écologique sur le campus. Il ou
                            elle assure aussi le suivi des préoccupations
                            étudiantes à travers des consultations régulières
                            avec les différentes instances et services
                            universitaires.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {elusUnivRennes.VPE.map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>

                    {/* CA */}
                    <div className="prose mb-4 max-w-none">
                        <h3 className="mb-4 text-xl font-semibold">
                            Conseil d'Administration (CA)
                        </h3>
                        <p className="text-justify">
                            Le Conseil d'Administration (CA) au sein de
                            l'Université de Rennes est l'organe décisionnel
                            central chargé de la gestion administrative et
                            financière de l'établissement. Il est composé de
                            représentants du personnel, des étudiants, des
                            partenaires extérieurs et des autorités académiques.
                            Le CA prend des décisions stratégiques concernant
                            les orientations générales, l'allocation des
                            ressources, les budgets, et les projets de
                            développement. Il veille également à l'application
                            des politiques de l'université et à son bon
                            fonctionnement dans l'intérêt de l'ensemble de la
                            communauté universitaire.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {elusUnivRennes.CA.map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>

                    {/* CFVE */}
                    <div className="prose mb-4 max-w-none">
                        <h3 className="mb-4 text-xl font-semibold">
                            Conseil de Formation & Vie Étudiante (CFVE)
                        </h3>
                        <p className="text-justify">
                            Le Conseil des Formations et de la Vie Étudiante
                            (CFVE) est une instance universitaire qui traite des
                            questions liées à l'organisation des formations, aux
                            modalités des examens, ainsi qu'à la vie étudiante.
                            Composé de représentants des enseignants, des
                            étudiants et du personnel administratif, le CFVE
                            prend des décisions sur l'offre de formation, les
                            règlements pédagogiques, les conditions
                            d'évaluation, et les actions pour améliorer la vie
                            étudiante. Il veille à ce que les parcours de
                            formation répondent aux besoins des étudiants tout
                            en contribuant à l'amélioration de leurs conditions
                            d'études et de vie sur le campus.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {elusUnivRennes.CFVE.map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>

                    {/* Conseil d'Unité de Formation & de Recherche (UFR) */}
                    <div className="prose mb-4 max-w-none">
                        <h3 className="mb-4 text-xl font-semibold">
                            Conseil d'Unité de Formation & de Recherche (UFR)
                        </h3>
                        <p className="text-justify">
                            Un Conseil d'Unité de Formation et de Recherche
                            (UFR) est un organe décisionnel au sein d'une
                            faculté ou d'un département universitaire. Il
                            regroupe des enseignants-chercheurs, des personnels
                            administratifs, des étudiants et parfois des
                            représentants extérieurs. Le Conseil d'UFR prend des
                            décisions sur les aspects pédagogiques et
                            scientifiques de l'unité, notamment l'organisation
                            des enseignements, la répartition des moyens et la
                            gestion des projets de recherche. Il joue un rôle
                            important dans la gestion quotidienne de l'UFR et
                            participe à la mise en œuvre des orientations
                            décidées par le Conseil d'Administration de
                            l'université.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {elusUnivRennes.UFR.map((cat, index) => (
                            <Fragment key={index}>
                                <h3 className="mb-2 text-lg font-semibold">
                                    {cat.title}
                                </h3>
                                <div
                                    key={index}
                                    className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                >
                                    {cat.elus.map((elu, index) => (
                                        <EluCard key={index} elu={elu} />
                                    ))}
                                </div>
                            </Fragment>
                        ))}
                    </div>

                    {/* Elu.e.s "EHESP Rennes" */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="mt-20 flex w-full flex-row items-center justify-center space-x-6">
                            <Image
                                src={logoEHESP}
                                alt="Logo EHESP Rennes"
                                className="h-auto w-32 md:h-44 md:w-auto"
                            />
                        </div>

                        <h2 className="mb-4 text-2xl font-semibold">
                            Nos élu.e.s au CA de l'EHESP Rennes
                        </h2>
                        <p className="py-3 text-sm font-medium">
                            Contact : btc.univrennes@fare-asso.fr
                        </p>
                    </div>

                    <div className="prose mb-4 max-w-none">
                        <p className="text-justify">
                            L'EHESP (École des Hautes Études en Santé Publique)
                            est un établissement d'enseignement supérieur et de
                            recherche spécialisé dans les domaines de la santé
                            publique, de la gestion des services de santé et de
                            l'action sociale. Les étudiants de l'EHESP sont
                            représentés au sein des instances de l'école par des
                            élu.e.s qui participent à la vie démocratique de
                            l'établissement et contribuent à l'amélioration des
                            conditions d'études et de vie des étudiants. Ces
                            élu.e.s sont des interlocuteurs privilégiés pour
                            faire remonter les préoccupations des étudiants et
                            proposer des actions en faveur de leur bien-être et
                            de leur réussite.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {elusEHESP.map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>
                </section>

                {/* Elu.e.s "Bouge ton Campus" de l'Université de Rennes 2 */}
                <section className="space-y-6">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="mt-20 flex w-full flex-row items-center justify-center space-x-6">
                            <Image
                                src={logoBougeTonCampus}
                                alt="Logo de Bouge Ton Campus"
                                className="h-auto w-32 md:h-44 md:w-auto"
                            />
                            <Image
                                src={logoUR2}
                                alt="Logo de l'Université de Rennes 2"
                                className="h-auto w-32 md:h-44 md:w-auto"
                            />
                        </div>
                        <h2 className="mb-4 text-2xl font-semibold">
                            Nos élu.e.s “Bouge Ton Campus” de l'Université de
                            Rennes 2
                        </h2>
                        <p className="py-3 text-sm font-medium">
                            Contact : btc.univrennes2@fare-asso.fr
                        </p>
                    </div>

                    {/* CA */}
                    {elusRennes2.CA && (
                        <>
                            <div className="prose mb-4 max-w-none">
                                <h3 className="mb-4 text-xl font-semibold">
                                    Conseil d'Administration (CA)
                                </h3>
                                <p className="text-justify">
                                    Le Conseil d'Administration (CA) au sein de
                                    l'Université de Rennes 2 est l'organe
                                    décisionnel central chargé de la gestion
                                    administrative et financière de
                                    l'établissement. Il est composé de
                                    représentants du personnel, des étudiants,
                                    des partenaires extérieurs et des autorités
                                    académiques. Le CA prend des décisions
                                    stratégiques concernant les orientations
                                    générales, l'allocation des ressources, les
                                    budgets, et les projets de développement. Il
                                    veille également à l'application des
                                    politiques de l'université et à son bon
                                    fonctionnement dans l'intérêt de l'ensemble
                                    de la communauté universitaire.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {elusRennes2.CA.map((elu, index) => (
                                    <EluCard key={index} elu={elu} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* CFVU */}
                    {elusRennes2.CFVU && (
                        <>
                            <div className="prose mb-4 max-w-none">
                                <h3 className="mb-4 text-xl font-semibold">
                                    Conseil de Formation & Vie Universitaire
                                    (CFVU)
                                </h3>
                                <p className="text-justify">
                                    Le Conseil des Formations et de la Vie
                                    Universitaire (CFVU) est une instance
                                    universitaire qui traite des questions liées
                                    à l'organisation des formations, aux
                                    modalités des examens, ainsi qu'à la vie
                                    étudiante. Composé de représentants des
                                    enseignants, des étudiants et du personnel
                                    administratif, le CFVU prend des décisions
                                    sur l'offre de formation, les règlements
                                    pédagogiques, les conditions d'évaluation,
                                    et les actions pour améliorer la vie
                                    étudiante. Il veille à ce que les parcours
                                    de formation répondent aux besoins des
                                    étudiants tout en contribuant à
                                    l'amélioration de leurs conditions d'études
                                    et de vie sur le campus.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {elusRennes2.CFVU.map((elu, index) => (
                                    <EluCard key={index} elu={elu} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Conseil d’Unité de Formation & de Recherche (UFR) */}
                    <div className="prose mb-4 max-w-none">
                        <h3 className="mb-4 text-xl font-semibold">
                            Conseil d'Unité de Formation & de Recherche (UFR)
                        </h3>
                        <p className="text-justify">
                            Un Conseil d'UFR (Unité de Formation et de
                            Recherche) est un organe décisionnel au sein d'une
                            faculté ou d'un département universitaire. Il
                            regroupe des enseignants-chercheurs, des personnels
                            administratifs, des étudiants et parfois des
                            représentants extérieurs. Le Conseil d'UFR prend des
                            décisions sur les aspects pédagogiques et
                            scientifiques de l'unité, notamment l'organisation
                            des enseignements, la répartition des moyens et la
                            gestion des projets de recherche. Il joue un rôle
                            important dans la gestion quotidienne de l'UFR et
                            participe à la mise en œuvre des orientations
                            décidées par le Conseil d'Administration de
                            l'université.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {elusRennes2.UFR.map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
