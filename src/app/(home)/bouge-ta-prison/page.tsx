import Link from 'next/link';
import Image from 'next/image';

import assemblee0 from '/public/BTP/assemblee1.jpg';
import assemblee1 from '/public/BTP/assemblee2.jpg';


export default function BougeTaPrison() {
    return (
        <div className="flex flex-col items-center justify-start w-full px-4 md:px-8 lg:px-16 mb-20">
            <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">Bouge Ta Prison</h1>

            <div className="max-w-4xl w-full space-y-12">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Qu'est-ce que le pôle Bouge Ta Prison ?</h2>
                    <p className="mb-4">
                        Le pôle Bouge Ta Prison est une initiative qui vise à sensibiliser notamment les étudiants sur le monde carcéral et à favoriser la réinsertion des personnes placées sous main de justice. Pour atteindre ces objectifs, différents projets sont mis en place.
                    </p>
                </section>

                <div className='flex flex-col md:flex-row space-y-3 space-x-0 md:space-y-0 md:space-x-2 [&>img]:rounded-xl [&>img]:w-full [&>img]:object-cover'>
                    <Image src={assemblee0} alt="Cantine de l'AGORAé" />
                    <Image src={assemblee1} alt="Nourriture proposée à l'AGORAé" />
                </div>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Sensibilisation au milieu carcéral</h2>
                    <p className="mb-4">
                        Le pôle organise des conférences pour sensibiliser au milieu carcéral. Par exemple, en février 2024, à l'Université de Rennes 2, deux visiteurs de prison sont venus témoigner de leurs expériences et expliquer le monde carcéral avec tous ses enjeux et ses difficultés.
                    </p>
                    <p className="mb-4">
                        La FAHB fait également partie du collectif prison Rennes depuis début d'année 2024 et participe pour la deuxième fois à l'organisation des journées nationales des prisons qui ont lieu tous les ans au mois de novembre. L'objectif est de faire connaître ces journées auprès des étudiants et d'inclure certains événements dans les universités. Par exemple, l'année dernière, une présentation de livres portant sur la réinsertion a été réalisée à l'Université Rennes 2.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Réinsertion des personnes placées sous main de justice</h2>
                    <p className="mb-4">
                        Le pôle Bouge Ta Prison propose l'accompagnement de personnes placées sous main de justice sur les différents campus universitaires lors de permissions de sortie. Cet accompagnement permet de faire visiter le campus, d'expliquer le fonctionnement administratif, l'emprunt de livres dans les bibliothèques universitaires, etc. En septembre 2023, le pôle a accompagné deux étudiants placés sous main de justice.
                    </p>
                    <p className="mb-4">
                        Le pôle organise également, en collaboration avec l'Université Rennes 2 et l'Administration pénitentiaire, du tutorat en détention pour les étudiants-détenus en reprise d'études universitaires. Le pôle assure le recrutement des tuteurs(ices), une partie de la formation et le suivi du tutorat toute l'année scolaire. L'année dernière, le pôle a accompagné 24 tuteurs(ices) qui sont intervenus à la prison des femmes de Rennes et à la prison des hommes de Vezin-le-Coquet en binôme pour suivre 12 détenus(es).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Couverture médiatique</h2>
                    <p className="mb-4">
                        Ces différents projets ont pu donner lieu à des articles de presse dans le Ouest France, France 3 et des journaux locaux.
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            <Link href="https://france3-regions.francetvinfo.fr/bretagne/ille-et-vilaine/rennes/temoignage-si-je-peux-aider-un-peu-pour-leur-reinsertion-tant-mieux-pourquoi-cette-etudiante-accompagne-les-detenus-qui-reprennent-leurs-etudes-2912339.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Article France 3 Régions
                            </Link>
                        </li>
                        <li>
                            <Link href="https://www.campusmatin.com/vie-campus/experience-etudiante/une-supbox-pour-repenser-l-acces-a-l-enseignement-superieur-en-prison.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Article Campus Matin
                            </Link>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}