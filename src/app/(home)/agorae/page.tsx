import Image from 'next/image';
import Link from 'next/link';

import salle from "/public/AGORAe/salle.jpg";
import food from "/public/AGORAe/food.jpg";

export default function AGORAe() {
    return (
        <div className="flex flex-col items-center justify-start w-full px-4 md:px-8 lg:px-16">
            <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">AGORAé</h1>

            <div className="max-w-4xl w-full space-y-12 mb-20 flex flex-col items-center">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Qu'est-ce que l'AGORAé ?</h2>
                    <p className="mb-4">
                        L'AGORAé est une <strong>épicerie sociale et solidaire créée par les étudiant.e.s et pour les étudiant.e.s</strong>. Elle se situe sur le campus universitaire briochin de Mazier, au sein du Ty-Maz, lieu central de la vie étudiante universitaire sur Saint-Brieuc.
                    </p>
                    <p className="mb-4">
                        C'est un projet national créé par la FAGE (Fédération des Associations Générales Étudiantes) et porté à Saint-Brieuc par la FAHB (Fédération des Associations de Haute-Bretagne). Les AGORAé sont des espaces d'échanges et de solidarité qui se composent d'un lieu de vie ouvert à tous.tes et d'une épicerie solidaire accessible sur critères sociaux.
                    </p>
                    <p className="mb-4">
                        Portées et gérées par des jeunes pour des jeunes, les AGORAé sont des lieux non-stigmatisants œuvrant pour l'égalité des chances d'accès et de réussite dans l'enseignement supérieur.
                    </p>
                    <p className="mb-4">
                        Elle a pour objectif de permettre aux étudiant.e.s en situation de précarité financière, <strong>une diminution de leurs dépenses quotidiennes</strong>. En effet, les différents produits alimentaires, d'hygiène ou d'entretien qui vous sont proposés sont revendus à hauteur de 10% à 20% de leur valeur en grande surface, ou distribués gratuitement.
                    </p>
                    <p>
                        Plus qu'un simple lieu d'aide alimentaire, c'est aussi <strong>un espace de rencontres, d'échanges et de convivialité</strong> que ce soit entre les étudiant.e.s bénéficiaires ou de part les actions mises en place pour lutter contre l'isolement social au sein de l'Enseignement Supérieur et de la Recherche sur le territoire.
                    </p>
                </section>

                <div className='flex flex-col md:flex-row space-y-3 space-x-0 md:space-y-0 md:space-x-2 [&>img]:rounded-xl [&>img]:w-full [&>img]:object-cover'>
                    <Image src={salle} alt="Cantine de l'AGORAé" />
                    <Image src={food} alt="Nourriture proposée à l'AGORAé" />
                </div>

                

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Comment devenir bénéficiaire de l'AGORAé ?</h2>
                    <p className="mb-4">
                        L'épicerie est ouverte aux étudiant.e.s, selon le reste à vivre quotidien : si ton reste à vivre (toutes tes recettes par mois – toutes tes dépenses /30) est inférieur à 7,50€, tu es éligible à l'aide alimentaire.
                    </p>
                    <p>
                        L'AGORAé est accessible via un dossier de demande d'admission, disponible <Link href="/path-to-pdf" className="text-blue-600 hover:underline">ici</Link> ou à l'adresse mail : <a href="mailto:agorae@fahb.eu" className="text-blue-600 hover:underline">agorae@fahb.eu</a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Envie de participer au projet AGORAé ?</h2>
                    <p>
                        Tu as quelques heures ou quelques jours de disponibles pour l'AGORAé et tu souhaite devenir bénévole ?
                        Tu peux envoyer un mail à <a href="mailto:agorae@fahb.eu" className="text-blue-600 hover:underline">agorae@fahb.eu</a> ou nous contacter sur le compte Instagram <a href="https://www.instagram.com/agorae.saint.brieuc" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@agorae.saint.brieuc</a> ou directement sur ce site internet.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Quand venir à l'AGORAé ?</h2>
                    <p>
                        Les heures d'ouverture sont indiquées directement sur le compte Instagram <a href="https://www.instagram.com/agorae.saint.brieuc" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@agorae.saint.brieuc</a>. En cas d'imprévu ou d'impossibilité de vous rendre sur place dans les horaires indiquées, merci de nous contacter à <a href="mailto:agorae@fahb.eu" className="text-blue-600 hover:underline">agorae@fahb.eu</a> ou sur le compte Instagram <a href="https://www.instagram.com/agorae.saint.brieuc" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@agorae.saint.brieuc</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}