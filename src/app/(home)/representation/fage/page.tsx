import Image from "next/image";

import logoFage from "/public/Logo_FAGE.png";

export default function FAGE() {
    return (
        <div className="flex flex-col items-center justify-start w-full px-4 md:px-8 lg:px-16">
            {/* <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">Fédération des Associations Générales Étudiantes (FAGE)</h1> */}

            <Image
                src={logoFage}
                alt="Logo de la FAGE"
                className="w-full md:w-1/2"
            />

            <div className="max-w-4xl w-full space-y-8 mb-20">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">
                        Présentation
                    </h2>
                    <p className="mb-4 italic">
                        La{" "}
                        <strong>
                            Fédération des associations générales étudiantes -
                            FAGE
                        </strong>{" "}
                        - est la première organisation étudiante de France.
                        Fondée en 1989, elle assoit son fonctionnement sur la
                        démocratie participative et regroupe près de 2000
                        associations et syndicats, soit environ 300 000
                        étudiantEs.
                    </p>
                    <p className="mb-4">
                        La FAGE a pour but de garantir l'égalité des chances de
                        réussite dans le système éducatif. C'est pourquoi elle
                        agit pour l'amélioration constante des conditions de vie
                        et d'études des jeunes en déployant des activités dans
                        le champ de la représentation et de la défense des
                        droits. En gérant des services et des œuvres répondant
                        aux besoins sociaux, elle est également actrice de
                        l'innovation sociale.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">
                        Reconnaissance et indépendance
                    </h2>
                    <p className="mb-4">
                        La FAGE est reconnue organisation étudiante
                        représentative par le Ministère chargé de l'enseignement
                        supérieur. Indépendante des partis, des syndicats de
                        salariés et des mutuelles étudiantes, elle base ses
                        actions sur une démarche militante, humaniste et
                        pragmatique. Partie prenante de l'économie sociale et
                        solidaire, elle est par ailleurs agréée jeunesse et
                        éducation populaire par le ministère chargé de la
                        jeunesse.
                    </p>
                    <p className="mb-4">
                        À travers la FAGE, les jeunes trouvent un formidable
                        outil citoyen pour débattre, entreprendre des projets et
                        prendre des responsabilités dans la société.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">
                        Rôle et valeurs
                    </h2>
                    <p className="mb-4">
                        La FAGE, en tant qu'organisation de jeunesse
                        représentative des étudiantEs, s'affirme comme un acteur
                        majeur de l'Éducation Populaire. Elle base ses
                        initiatives sur les valeurs de solidarité et de
                        progressisme. Face aux multiples défis et besoins
                        sociaux des jeunes, la FAGE est tenue d'agir afin de
                        répondre à leurs préoccupations et d'orienter les
                        politiques publiques en faveur des jeunes et des
                        étudiantEs.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Histoire</h2>
                    <p className="mb-4">
                        À la fin des années 80, l'idée de fonder une
                        organisation germe à Lyon. Plusieurs réunions, se
                        déroulant à Paris, mènent par la suite à l'assemblée
                        constitutive de la FAGE le 20 novembre 1989, à la
                        Faculté de pharmacie de Paris V. L'enjeu principal ?
                        Obtenir une reconnaissance nationale et permettre aux
                        associations étudiantes de dialoguer directement avec le
                        ministère, en réponse à la loi d'orientation sur
                        l'éducation du 10 juillet 1989.
                    </p>
                    <p className="mb-4">
                        Depuis lors, la FAGE a réalisé d'importantes avancées en
                        faveur des étudiantEs et de la jeunesse, se positionnant
                        comme l'unique héritière des AGE. Forte des membres de
                        son réseau et de ses projets, la FAGE s'efforce
                        quotidiennement de se perfectionner pour répondre aux
                        besoins de la jeunesse.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">
                        Projet éducatif
                    </h2>
                    <p className="mb-4">
                        Dans une volonté d'émancipation et de développement
                        personnel, le projet éducatif, pour la deuxième fois
                        depuis sa création, offre l'opportunité de découvrir ce
                        que la FAGE a à offrir. Il vise à donner à chaque
                        individu, quelles que soient ses responsabilités au sein
                        de l'organisation, son niveau d'investissement et sa
                        manière de s'engager, un repère pour donner du sens aux
                        projets destinés à ses pairs.
                    </p>
                </section>
            </div>
        </div>
    );
}
