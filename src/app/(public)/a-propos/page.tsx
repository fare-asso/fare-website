import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "À propos de la FARE"
}

export default function APropos() {
    return (
        <div className="flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            {/* <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Fédération des Associations de Haute-Bretagne (FARE)
            </h1> */}

            {/* TODO : Need to crop the picture to fit the logo and improve the svg file */}
            {/* <Image
                src={logoFARE}
                alt="Logo de la Fédération des Associations de Haute-Bretagne"
                className="mb-12 w-3/10 md:w-1/2"
            /> */}

            <div className="mb-20 w-full max-w-4xl space-y-8">
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">
                        Qu'est-ce que la FARE ?
                    </h2>
                    <p className="mb-4 text-justify">
                        La{" "}
                        <strong>
                            Fédération des Associations du Réseau Étudiant de
                            Haute-Bretagne (FARE)
                        </strong>{" "}
                        est une association à but non lucratif de loi 1901.
                        C'est une organisation représentative des étudiant·e·s,
                        présente sur les départements d'Ille-et-Vilaine et des
                        Côtes-d'Armor. Depuis le 11 octobre 2025, notre
                        fédération de territoire met toutes ses ressources et
                        son savoir-faire au service de l'intérêt des
                        étudiant·e·s. Notre organisation régionale humaniste et
                        militante fonde son fonctionnement sur la démocratie
                        participative. Elle est menée par des associations
                        étudiantes et réunit les jeunes dans le respect mutuel
                        de leurs convictions personnelles, philosophiques,
                        morales ou religieuses.
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">
                        Indépendance et représentation
                    </h2>
                    <p className="mb-4 text-justify">
                        Indépendante de tout parti politique, syndicat ou
                        confession, notre fédération regroupe plus d'une
                        quinzaine d'associations à Rennes, Saint-Malo, Fougères
                        et Saint-Brieuc, et est présente dans les divers
                        conseils universitaires et au CROUS Bretagne.
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">
                        Des associations étudiantes à votre service
                    </h2>
                    <p className="mb-4">
                        Nous avons la volonté chaque jour de contribuer à
                        améliorer la vie et le quotidien des 88 000 étudiant·e·s
                        du territoire. En montant des projets de service à
                        l'étudiant·e, nous parvenons à avancer tous·tes
                        ensemble. Engagé·e·s, la fédération et l'ensemble de ses
                        associations sont présent·e·s pour tous·tes{" "}
                        <strong>
                            "par les étudiant·e·s et pour les étudiant·e·s"
                        </strong>
                        .
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">Nos actions</h2>
                    <p className="mb-4 text-justify">
                        En tant qu'acteur·rice·s associatif·ve·s, nous réalisons
                        des projets d'innovation sociale à destination des
                        étudiant·e·s et plus largement des jeunes :
                    </p>
                    <ul className="list-inside list-disc space-y-2 pl-4">
                        <li>Événements de sensibilisation et de prévention</li>
                        <li>Défense des droits</li>
                        <li>Tutorat auprès des personnes incarcérées</li>
                        <li>
                            Actions de lutte contre la précarité étudiante (ex :
                            AGORAé)
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    )
}
