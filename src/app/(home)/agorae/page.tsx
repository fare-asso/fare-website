import Image from "next/image"
import Link from "next/link"
import food from "#public/AGORAe/food.jpg"
import logoAgoraE from "#public/AGORAe/logo_AgoraE.png"
import recettesParMois from "#public/AGORAe/recettes_par_mois.png"
import salle from "#public/AGORAe/salle.jpg"
import tableauRAV from "#public/AGORAe/tableau_rav.png"
import CalculateurBeneficiaire from "@/components/public/agorae/calculateurBeneficiaire"

export default function AGORAe() {
    return (
        <div className="flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            {/* <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">AGORAé</h1> */}

            <Image
                src={logoAgoraE}
                alt="Logo de l'AGORAé"
                className="w-full md:w-1/2"
            />

            <div className="mb-20 flex w-full max-w-4xl flex-col items-center space-y-12">
                <section>
                    <h2 className="mb-4 font-semibold text-2xl">
                        L'AGORAé, la lutte contre la pauvreté étudiante sur
                        Saint-Brieuc
                    </h2>
                    <p className="mb-4">
                        L'AGORAé est une{" "}
                        <strong>
                            épicerie sociale et solidaire créée par les
                            étudiant·e·s et pour les étudiant·e·s
                        </strong>
                        . Elle se situe sur le campus universitaire briochin de
                        Mazier, au sein du Ty-Maz', lieu central de la vie
                        étudiante universitaire sur{" "}
                        <strong>Saint-Brieuc</strong> (22).
                    </p>
                    <p className="mb-4">
                        Elle a pour objectif de permettre aux étudiant·e·s en
                        situation de précarité financière,{" "}
                        <strong>
                            une diminution de leurs dépenses quotidiennes
                        </strong>
                        . En effet, les différents produits alimentaires,
                        d'hygiène ou d'entretien qui vous sont proposés sont
                        revendus à hauteur de <strong>10%</strong> de leur
                        valeur en grande surface, ou distribués{" "}
                        <strong>gratuitement</strong>.
                    </p>
                    <p className="mb-4">
                        Plus qu'un simple lieu d'aide alimentaire, c'est aussi{" "}
                        <strong>
                            un espace de rencontres, d'échanges et de
                            convivialité
                        </strong>{" "}
                        que ce soit entre les étudiant·e·s bénéficiaires ou de
                        part les actions mises en place pour lutter contre
                        l'isolement social des étudiant·e·s sur le territoire.
                    </p>
                    <p className="mb-4">
                        C'est un projet national créé par la{" "}
                        <Link
                            href="/representation/fage"
                            className="text-blue-600 hover:underline"
                        >
                            FAGE
                        </Link>{" "}
                        (Fédération des Associations Générales Étudiantes) et
                        porté à Saint-Brieuc par la{" "}
                        <Link
                            href="/a-propos"
                            className="text-blue-600 hover:underline"
                        >
                            FARE
                        </Link>{" "}
                        (Fédération des Associations de Haute-Bretagne). Les
                        AGORAé sont des espaces d'échanges et de solidarité qui
                        se composent d'un lieu de vie ouvert à tous·tes et d'une
                        épicerie solidaire accessible sur critères sociaux.
                    </p>
                    <p className="mb-4">
                        Portées et gérées par des jeunes pour des jeunes, les
                        AGORAé sont des lieux non-stigmatisants œuvrant pour
                        l'égalité des chances d'accès et de réussite dans
                        l'enseignement supérieur.
                    </p>
                </section>

                <div className="flex flex-col space-x-0 space-y-3 md:flex-row md:space-x-2 md:space-y-0 [&>img]:w-full [&>img]:rounded-xl [&>img]:object-cover md:[&>img]:w-1/2">
                    <Image src={salle} alt="Cantine de l'AGORAé" />
                    <Image src={food} alt="Nourriture proposée à l'AGORAé" />
                </div>

                <section>
                    <h2 className="mb-4 font-semibold text-2xl">
                        Comment devenir bénéficiaire de l'AGORAé ?
                    </h2>
                    <p className="mb-4">
                        L'épicerie est ouverte aux étudiant·e·s, selon le{" "}
                        <strong>Reste à Vivre (RAV) quotidien</strong>. Celui-ci
                        correspond à la somme restante par jour pour se nourrir,
                        après le paiement des charges courantes quotidiennes. Il
                        est calculé selon la formule suivante :
                    </p>

                    <div className="flex w-full flex-col items-center">
                        <Image
                            src={recettesParMois}
                            alt="Schéma du calcul pour devenir bénéficiaire de l'AGORAé"
                            className="w-full md:w-1/2"
                        />
                    </div>

                    <p className="mb-4">
                        Grâce à ce RAV, nous pouvons ensuite calculer le montant
                        de panier mensuel à proposer à chaque étudiant·e :
                    </p>

                    <div className="flex w-full flex-col items-center">
                        <Image
                            src={tableauRAV}
                            alt="Tableau de calcul d'éligibilité à l'aide alimentaire mensuel"
                            className="w-full md:w-1/2"
                        />
                    </div>

                    <div className="mb-16">
                        <CalculateurBeneficiaire />
                    </div>

                    <p className="mb-4">
                        L'inscription à l'AGORAé se fait sur{" "}
                        <a
                            href="https://mon-compte.fage.org/creation-compte"
                            title="Inscription AGORAé"
                            target="blank"
                            className="text-blue-600 hover:underline"
                        >
                            https://mon-compte.fage.org/
                        </a>{" "}
                        et ne prend que quelques minutes.
                    </p>

                    <p className="mb-0">
                        Si vous êtes en difficulté pour compléter cette
                        démarche, vous pouvez nous contacter à{" "}
                        <a
                            href="mailto:agorae@fare-asso.fr"
                            target="blank"
                            className="text-blue-600 hover:underline"
                        >
                            agorae@fare-asso.fr
                        </a>{" "}
                        ou venir nous rencontrer lors des permanences de
                        l'épicerie.
                    </p>

                    {/* <p>
                        L'AGORAé est accessible via un dossier de demande d'admission, disponible <Link href="/path-to-pdf" className="text-blue-600 hover:underline">ici</Link> ou à l'adresse mail : <a href="mailto:agorae@fare-asso.fr" className="text-blue-600 hover:underline">agorae@fare-asso.fr</a>.
                    </p> */}
                </section>

                <section>
                    <h2 className="mb-4 font-semibold text-2xl">
                        Envie de participer au projet AGORAé ?
                    </h2>
                    <p className="mb-4">
                        Tu as quelques heures ou quelques jours de disponibles
                        pour l'AGORAé et tu souhaite devenir bénévole ? Tu
                        souhaites participer à l'accueil, la gestion des stocks
                        ou la communication ?
                    </p>
                    <p>
                        Tu peux remplir ce{" "}
                        <a
                            className="text-blue-600 hover:underline"
                            href="https://forms.gle/DHoMDL7N3QRHTL1w7"
                            target="blank"
                        >
                            formulaire d'inscription
                        </a>
                        . Tout engagement est le bienvenu.
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 font-semibold text-2xl">
                        Quand venir à l'AGORAé ?
                    </h2>
                    <p>
                        Les heures d'ouverture sont indiquées directement sur le
                        compte Instagram{" "}
                        <a
                            href="https://www.instagram.com/agorae.saint.brieuc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            @agorae.saint.brieuc
                        </a>
                        . En cas d'imprévu ou d'impossibilité de vous rendre sur
                        place dans les horaires indiquées, merci de nous
                        contacter à{" "}
                        <a
                            href="mailto:agorae@fare-asso.fr"
                            className="text-blue-600 hover:underline"
                        >
                            agorae@fare-asso.fr
                        </a>{" "}
                        ou sur le compte Instagram{" "}
                        <a
                            href="https://www.instagram.com/agorae.saint.brieuc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            @agorae.saint.brieuc
                        </a>
                        .
                    </p>
                </section>

                <section>
                    <h2>Liens utiles</h2>

                    <ul>
                        <li>
                            <Link
                                href="https://soliguide.fr/fr/fiche/agorae-saint-brieuc-37414"
                                title="Lien vers soliguide"
                                className="text-blue-600 hover:underline"
                            >
                                Soliguide - AGORAé Saint-Brieuc
                            </Link>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    )
}
