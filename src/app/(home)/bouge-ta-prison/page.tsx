import Link from "next/link";
import Image from "next/image";

import assemblee0 from "/public/BTP/assemblee1.jpg";
import assemblee1 from "/public/BTP/assemblee2.jpg";

import logoBTP from "/public/BTP/LOGO_BTP_2024.webp";

// Create metadata for the page
export const metadata = {
    title: "Bouge Ta Prison | FAHB",
};

export default function BougeTaPrison() {
    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            {/* <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">Bouge Ta Prison</h1> */}

            <Image
                src={logoBTP}
                alt="Logo du projet Bouge Ta Prison"
                className="w-full md:w-1/2"
            />

            <div className="w-full max-w-4xl space-y-12">
                <section>
                    <h2>Qu'est-ce que le projet Bouge Ta Prison ?</h2>
                    <p className="mb-4">
                        Le projet Bouge Ta Prison est une initiative qui vise à
                        sensibiliser notamment les étudiant·e·s sur le monde
                        carcéral et à favoriser la réinsertion des personnes
                        placées sous main de justice. Pour atteindre ces
                        objectifs, différents dispositifs sont mis en place.
                    </p>
                </section>

                <section>
                    <h2>Sensibilisation au milieu carcéral</h2>
                    <p className="mb-4">
                        Afin de sensibiliser au milieu carcéral, le pôle
                        organise des conférences. C'était le cas en février
                        2024, à l'Université de Rennes 2, deux visiteurs de
                        prison sont venus témoigner de leurs expériences et
                        expliquer le monde carcéral avec tous ses enjeux et ses
                        difficultés qu'il présente.
                    </p>

                    <div className="mb-4 flex flex-col space-x-0 space-y-3 md:flex-row md:space-x-2 md:space-y-0 [&>img]:w-full [&>img]:rounded-xl [&>img]:object-cover md:[&>img]:w-1/2">
                        <Image
                            src={assemblee0}
                            alt="Photo d'une conférence de sensibilisation du milieu carcéral à l'Université de Rennes 2 qui s'est déroulée en février 2024"
                        />
                        <Image
                            src={assemblee1}
                            alt="Deuxième photo de la conférence de sensibilisation du milieu carcéral à l'Université de Rennes 2"
                        />
                    </div>

                    <p className="mb-4">
                        La FAHB fait également partie du{" "}
                        <Link
                            href="https://collectifprisonrennes.fr/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                        >
                            collectif prison Rennes
                        </Link>{" "}
                        depuis début d'année 2024 et participe pour la deuxième
                        fois à l'organisation des{" "}
                        <strong>Journées Nationales des Prisons (JNP)</strong>{" "}
                        qui ont lieu tous les ans au mois de novembre.
                        L'objectif est de faire connaître ces journées auprès
                        des étudiant·e·s et d'inclure certains événements dans
                        les universités. Par exemple, l'année dernière, une
                        présentation de livres portant sur la réinsertion a été
                        réalisée à l'Université Rennes 2.
                    </p>
                </section>

                <section>
                    <h2>
                        Réinsertion des personnes placées sous main de justice
                    </h2>
                    <p className="mb-4">
                        Le projet Bouge Ta Prison propose l'accompagnement de
                        personnes placées sous main de justice sur les
                        différents campus universitaires lors de permissions de
                        sortie. Cet accompagnement permet de faire visiter le
                        campus, d'expliquer le fonctionnement administratif,
                        l'emprunt de livres dans les bibliothèques
                        universitaires, etc. En septembre 2023, le projet a
                        accompagné deux étudiant·e·s placé·e·s sous main de
                        justice.
                    </p>
                    <p className="mb-4">
                        Le projet organise également, en collaboration avec
                        l'Université Rennes 2 et l'Administration pénitentiaire,
                        du tutorat en détention pour les étudiant·e·s-détenu·e·s
                        en reprise d'études universitaires. Le projet assure le
                        recrutement des tuteur·rice·s), une partie de la
                        formation et le suivi du tutorat toute l'année scolaire.
                        L'année dernière, le projet a accompagné 24
                        tuteurs(ices) qui sont intervenu·e·s au Centre
                        Pénitentiaire pour Femmes de Rennes et à la Centre
                        Pénitentiaire pour Hommes de Vezin-le-Coquet en binôme
                        pour suivre 12 détenu·e·s.
                    </p>

                    {/* Intéressé pour devenir tuteur? */}
                    <div className="flex h-auto w-full flex-col items-center pt-4">
                        <div className="flex w-full flex-col rounded-xl bg-black p-8 text-white md:w-3/4">
                            <h2 className="mb-2 text-lg font-semibold">
                                Intéressé pour devenir tuteur?
                            </h2>
                            <p>
                                Le projet Bouge Ta Prison accueille de nouveaux
                                tuteurs chaque année. <br />
                                Pour en savoir plus sur le tutorat, les
                                prérequis et les modalités, cliquez ci-dessous.
                            </p>
                            <Link
                                href="/bouge-ta-prison/tutorat"
                                className="ml-auto mt-4 w-full rounded-full border-white bg-white px-4 py-2 text-center font-semibold text-black transition-all hover:scale-105 md:w-1/3"
                            >
                                En savoir plus
                            </Link>
                        </div>
                    </div>
                </section>

                <section>
                    <h2>Couverture médiatique</h2>
                    <p className="mb-4">
                        Ces différents projets ont pu donner lieu à des articles
                        de presse dans le Ouest France, France 3 et des journaux
                        locaux.
                    </p>
                    <ul className="list-inside list-disc space-y-2">
                        <li>
                            <Link
                                href="https://france3-regions.francetvinfo.fr/bretagne/ille-et-vilaine/rennes/temoignage-si-je-peux-aider-un-peu-pour-leur-reinsertion-tant-mieux-pourquoi-cette-etudiante-accompagne-les-detenus-qui-reprennent-leurs-etudes-2912339.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link"
                            >
                                Article France 3 Régions
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="https://www.campusmatin.com/vie-campus/experience-etudiante/une-supbox-pour-repenser-l-acces-a-l-enseignement-superieur-en-prison.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link"
                            >
                                Article Campus Matin
                            </Link>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
