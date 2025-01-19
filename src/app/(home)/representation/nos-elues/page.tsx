import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import logoCrous from "/public/Logo_Crous_vectorisé.png";

import logoUR from "/public/univ/UNIRENNES_LOGOnoir_centre_RVB.png";
import logoUR2 from "/public/univ/Logo_univ-rennes2-2016.png";

import logoBougeTonCampus from "/public/elues/logo-Bouge-Ton-Campus.png";
import logoBougeTonCrous from "/public/elues/logo-Bouge-Ton-Crous.png";

import Image from "next/image";

interface Elu {
    firstName: string;
    lastName: string;
    position: string;
    details: string;
}

const EluCard = ({ elu }: { elu: Elu }) => {
    return (
        <Card className="w-full">
            <CardContent className="p-4 space-y-4">
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
    );
};

export default function Elues() {
    return (
        <div className="flex flex-col items-center justify-start w-full px-4 md:px-8 lg:px-16">
            <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">
                Nos élu·e·s étudiant·e·s de la FAHB
            </h1>

            {/* Headers pictures */}
            {/* <div className="w-[80%] flex flex-row space-x-12 items-center justify-center mb-12">
                <Image src={logoBougeTonCrous} alt="Logo Bouge Ton Crous" className='w-44 h-auto'/>
                <Image src={logoBougeTonCampus} alt="Logo Bouge Ton Campus" className='w-44 h-auto'/>
            </div> */}

            <div className="max-w-4xl w-full space-y-12 mb-20">
                <div className="prose max-w-none mb-20 bg-black text-white rounded-lg p-6">
                    <p>
                        La FAHB a parmi ses missions principales de représenter
                        l'ensemble des étudiant.e.s de Haute-Bretagne. Pour ce
                        faire, notre fédération se mobilise au quotidien par des
                        élu.e.s, étudiant.e.s engagé.e.s au sein de la FAHB, qui
                        ont pour rôle de siéger dans différents conseils.
                    </p>
                </div>

                {/* Elu.e.s "Bouge ton Crous" */}
                <section className="space-y-6">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-full flex flex-row items-center justify-center space-x-6 mt-20">
                            <Image
                                src={logoBougeTonCrous}
                                alt="Logo Bouge Ton Crous"
                                className="w-32 h-auto md:w-auto md:h-44"
                            />
                            <Image
                                src={logoCrous}
                                alt="Logo du Crous Bretagne"
                                className="w-32 h-auto md:w-auto md:h-44"
                            />
                        </div>

                        <h2 className="text-2xl font-semibold mb-4">
                            Nos élu.e.s “Bouge Ton CROUS” au CROUS Bretagne
                        </h2>
                    </div>

                    <div className="prose max-w-none mb-4">
                        <p>
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
                        <p className="text-sm font-medium">
                            Contact : elus.crous@fahb.eu
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[
                            {
                                firstName: "Zoée",
                                lastName: "PEROCHON-DE-JAMETEL",
                                position: "Titulaire",
                                details: "Étudiante en Psychologie",
                            },
                            {
                                firstName: "Gurvan",
                                lastName: "MORVAN",
                                position: "Titulaire",
                                details: "Étudiant en Soins infirmiers",
                            },
                            {
                                firstName: "Agathe",
                                lastName: "LEMU",
                                position: "Titulaire",
                                details: "Étudiante en Langues",
                            },
                            {
                                firstName: "Yoann",
                                lastName: "ZARAGOSA",
                                position: "Suppléant",
                                details: "Étudiant en Informatique",
                            },
                            {
                                firstName: "Ninon",
                                lastName: "BRIAND",
                                position: "Suppléante",
                                details: "Étudiante en Pharmacie",
                            },
                            {
                                firstName: "Robin",
                                lastName: "HUET",
                                position: "Suppléant",
                                details: "Étudiant en AES",
                            },
                        ].map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>
                </section>

                {/* Elu.e.s "Bouge ton Campus" de l'Université de Rennes */}
                <section className="space-y-6">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-full flex flex-row items-center justify-center space-x-6 mt-20">
                            <Image
                                src={logoBougeTonCampus}
                                alt="Logo de Bouge Ton Campus"
                                className="w-32 h-auto md:w-auto md:h-44"
                            />
                            <Image
                                src={logoUR}
                                alt="Logo de l'Université de Rennes"
                                className="w-32 h-auto md:w-auto md:h-44"
                            />
                        </div>

                        <h2 className="text-2xl font-semibold mb-4">
                            Nos élu.e.s “Bouge Ton Campus” de l'Université de
                            Rennes
                        </h2>
                    </div>

                    {/* VPE */}
                    <div className="prose max-w-none mb-4">
                        <h3 className="text-xl font-semibold mb-4">
                            Vice-Présidence Étudiante (VPE)
                        </h3>
                        <p>
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
                        <p className="text-sm font-medium">
                            Contact : elus.univ@fahb.eu
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[
                            {
                                firstName: "Mathilde",
                                lastName: "GUERLESQUIN",
                                position: "VPE",
                                details: "Étudiante en Sciences Politiques",
                            },
                        ].map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>

                    {/* CA */}
                    <div className="prose max-w-none mb-4">
                        <h3 className="text-xl font-semibold mb-4">
                            Conseil d'Administration (CA)
                        </h3>
                        <p>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[
                            {
                                firstName: "Mathilde",
                                lastName: "GUERLESQUIN",
                                position: "Titulaire",
                                details: "Étudiante en Sciences Politiques",
                            },
                            {
                                firstName: "Ulysse",
                                lastName: "DAVID",
                                position: "titulaire",
                                details: "Étudiant ingénieur",
                            },
                            {
                                firstName: "Tristan",
                                lastName: "GONTIER",
                                position: "Suppléant",
                                details: "Étudiant en IUT",
                            },
                            {
                                firstName: "Maëlyss",
                                lastName: "CABON",
                                position: "Suppléante",
                                details: "Étudiante en Informatique",
                            },
                        ].map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>

                    {/* CFVE */}
                    <div className="prose max-w-none mb-4">
                        <h3 className="text-xl font-semibold mb-4">
                            Conseil de Formation & Vie Étudiante (CFVE)
                        </h3>
                        <p>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[
                            {
                                firstName: "Valentin",
                                lastName: "REGNAULT",
                                position: "Titulaire",
                                details: "Étudiant en Informatique",
                            },
                            {
                                firstName: "Thomas",
                                lastName: "HURTAUD",
                                position: "Titulaire",
                                details: "Étudiant en IUT",
                            },
                            {
                                firstName: "Jérémy",
                                lastName: "PREMEL",
                                position: "Titulaire",
                                details: "Étudiant en Droit",
                            },
                            {
                                firstName: "Carla",
                                lastName: "RICHARD",
                                position: "Titulaire",
                                details: "Étudiante en Odontologie",
                            },
                            {
                                firstName: "Bryan",
                                lastName: "GROUSSARD",
                                position: "Suppléant",
                                details: "Étudiant en Soins infirmiers",
                            },
                            {
                                firstName: "Estela",
                                lastName: "STANKOV",
                                position: "Suppléante",
                                details: "Étudiante en Biologie",
                            },
                            {
                                firstName: "Paol",
                                lastName: "LE GALLOU",
                                position: "Suppléant",
                                details: "Étudiant ingénieur",
                            },
                        ].map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>

                    {/* Conseil d'Unité de Formation & de Recherche (UFR) */}
                    <div className="prose max-w-none mb-4">
                        <h3 className="text-xl font-semibold mb-4">
                            Conseil d'Unité de Formation & de Recherche (UFR)
                        </h3>
                        <p>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[
                            {
                                firstName: "Gabrielle",
                                lastName: "CORREIA",
                                position: "Titulaire",
                                details: "Étudiante en Kinésithérapie",
                            },
                            {
                                firstName: "Laure",
                                lastName: "CHABOT",
                                position: "Titulaire",
                                details: "Étudiante en Soins infirmiers",
                            },
                            {
                                firstName: "Carla",
                                lastName: "RICHARD",
                                position: "Titulaire",
                                details: "Étudiante en Odontologie",
                            },
                            {
                                firstName: "Liz-Marie",
                                lastName: "PRAUD",
                                position: "Titulaire",
                                details: "Étudiante en Odontologie",
                            },
                            {
                                firstName: "Yves",
                                lastName: "ALLAIN",
                                position: "Titulaire",
                                details: "Étudiant en Odontologie",
                            },
                        ].map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>
                </section>

                {/* Elu.e.s "Bouge ton Campus" de l'Université de Rennes 2 */}
                <section className="space-y-6">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="w-full flex flex-row items-center justify-center space-x-6 mt-20">
                            <Image
                                src={logoBougeTonCampus}
                                alt="Logo de Bouge Ton Campus"
                                className="w-32 h-auto md:w-auto md:h-44"
                            />
                            <Image
                                src={logoUR2}
                                alt="Logo de l'Université de Rennes 2"
                                className="w-32 h-auto md:w-auto md:h-44"
                            />
                        </div>
                        <h2 className="text-2xl font-semibold mb-4">
                            Nos élu.e.s “Bouge Ton Campus” de l'Université de
                            Rennes 2
                        </h2>
                    </div>

                    {/* CA */}
                    <div className="prose max-w-none mb-4">
                        <h3 className="text-xl font-semibold mb-4">
                            Conseil d'Administration (CA)
                        </h3>
                        <p>
                            Le Conseil d'Administration (CA) au sein de
                            l'Université de Rennes 2 est l'organe décisionnel
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[
                            {
                                firstName: "Robin",
                                lastName: "HUET",
                                position: "Titulaire",
                                details: "Étudiant en AES",
                            },
                            {
                                firstName: "Orane",
                                lastName: "MÉNAGER",
                                position: "Suppléante",
                                details: "Étudiante en STAPS",
                            },
                        ].map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>

                    {/* CFVU */}
                    <div className="prose max-w-none mb-4">
                        <h3 className="text-xl font-semibold mb-4">
                            Conseil de Formation & Vie Universitaire (CFVU)
                        </h3>
                        <p>
                            Le Conseil des Formations et de la Vie Universitaire
                            (CFVU) est une instance universitaire qui traite des
                            questions liées à l'organisation des formations, aux
                            modalités des examens, ainsi qu'à la vie étudiante.
                            Composé de représentants des enseignants, des
                            étudiants et du personnel administratif, le CFVU
                            prend des décisions sur l'offre de formation, les
                            règlements pédagogiques, les conditions
                            d'évaluation, et les actions pour améliorer la vie
                            étudiante. Il veille à ce que les parcours de
                            formation répondent aux besoins des étudiants tout
                            en contribuant à l'amélioration de leurs conditions
                            d'études et de vie sur le campus.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[
                            {
                                firstName: "Elisa",
                                lastName: "BOINET",
                                position: "Titulaire",
                                details: "Étudiante en STAPS",
                            },
                            {
                                firstName: "Eliott",
                                lastName: "LESUEUR",
                                position: "Titulaire",
                                details:
                                    "Étudiant en Information-Communication",
                            },
                            {
                                firstName: "Alexis",
                                lastName: "WALTER",
                                position: "Titulaire",
                                details: "Étudiant en AES",
                            },
                        ].map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>

                    {/* Conseil d’Unité de Formation & de Recherche (UFR) */}
                    <div className="prose max-w-none mb-4">
                        <h3 className="text-xl font-semibold mb-4">
                            Conseil d'Unité de Formation & de Recherche (UFR)
                        </h3>
                        <p>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[
                            {
                                firstName: "Elisa",
                                lastName: "BOINET",
                                position: "Titulaire",
                                details: "Étudiante en STAPS",
                            },
                            {
                                firstName: "Manaël",
                                lastName: "FORGET",
                                position: "Titulaire",
                                details: "Étudiant en STAPS",
                            },
                            {
                                firstName: "Anthony",
                                lastName: "GUYOMARD",
                                position: "Titulaire",
                                details: "Étudiant en STAPS",
                            },
                            {
                                firstName: "Lysia",
                                lastName: "LE COENT",
                                position: "Titulaire",
                                details: "Étudiante en STAPS",
                            },
                        ].map((elu, index) => (
                            <EluCard key={index} elu={elu} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
