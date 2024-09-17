
import Image from 'next/image';

import logoFAHB from '/public/logo_FAHB.png';

export default function APropos() {
    return (
        <div className="flex flex-col items-center justify-start w-full px-4 md:px-8 lg:px-16">
            <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">Fédération des Associations de Haute-Bretagne (FAHB)</h1>

            {/* TODO : Need to crop the picture to fit the logo and improve the svg file */}
            {/* <Image src={logoFAHB} alt="Logo de la FAHB" className="w-full md:w-1/2" /> */}

            <div className="max-w-4xl w-full space-y-8 mb-20">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Qu'est-ce que la FAHB ?</h2>
                    <p className="mb-4">
                        La Fédération des Associations de Haute-Bretagne (FAHB) est une association à but non lucratif de loi 1901. C'est une organisation représentative des étudiant·e·s, présente sur les départements d'Ille-et-Vilaine et des Côtes d'Armor.
                    </p>
                    <p className="mb-4">
                        Depuis le 24 octobre 2018, notre fédération de territoire met toutes ses ressources et son savoir-faire au service de l'intérêt des étudiant·e·s. Notre organisation régionale humaniste et militante fonde son fonctionnement sur la démocratie participative. Elle est menée par des associations étudiantes et réunit les jeunes dans le respect mutuel de leurs convictions personnelles, philosophiques, morales ou religieuses.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Indépendance et représentation</h2>
                    <p className="mb-4">
                        Indépendante de tout parti politique, syndicat ou confession, notre fédération regroupe plus d'une vingtaine d'associations à Rennes, Bruz, Fougères et Saint-Brieuc, et est présente dans les divers conseils universitaires et au CROUS Bretagne.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Des associations étudiantes à votre service</h2>
                    <p className="mb-4">
                        Nous avons la volonté chaque jour de contribuer à améliorer la vie et le quotidien des 88 000 étudiant·e·s du territoire. En montant des projets de service à l'étudiant·e, nous parvenons à avancer tous·tes ensemble. Engagé·e·s, la fédération et l'ensemble de ses associations sont présent·e·s pour tous·tes <strong>"par les étudiant·e·s et pour les étudiant·e·s"</strong>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Nos actions</h2>
                    <p className="mb-4">
                        En tant qu'acteur·rice·s associatif·ve·s, nous réalisons des projets d'innovation sociale à destination des étudiant·e·s et plus largement des jeunes :
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2">
                        <li>Événements de sensibilisation et de prévention</li>
                        <li>Défense des droits</li>
                        <li>Tutorat auprès des personnes incarcérées</li>
                        <li>Actions de lutte contre la précarité étudiante (ex : AGORAé)</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}