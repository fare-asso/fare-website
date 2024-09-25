
import Image from "next/image"

import EluCard from "@/components/public/elues/eluCard"

import logoUR2 from "/public/univ/Logo_univ-rennes2-2016.png"
import logoUR from "/public/univ/UNIRENNES_LOGOnoir_centre_RVB.png"
import logoCrous from "/public/Logo_Crous_vectorisé.png"

// Imports elues CROUS
import AgatheTitulaire from "/public/elues/crous/Agathe-Titulaire.jpg"
import GurvanTitulaire from "/public/elues/crous/Gurvan-Titulaire.jpg"
import ZoeeTitulaire from "/public/elues/crous/Zoée-Titulaire.jpg"

// Imports elues UR2
import RobinTitulaire from "/public/elues/ur2/ca/Robin-titulaire.jpg"
import EliottTitulaire from "/public/elues/ur2/cfvu/Eliott-titulaire.jpg"
import ElisaTitulaire from "/public/elues/ur2/cfvu/Elisa-titulaire.jpg"
import AnthonyTitulaire from "/public/elues/ur2/staps/Anthony-titulaire.png"

// Imports elues UR
import MathildeTitulaire from "/public/elues/ur/ca/Mathilde-titulaire.jpg"
import UlysseTitulaire from "/public/elues/ur/ca/Ulysse-titulaire.jpg"
import CarlaTitulaire from "/public/elues/ur/cfve/Carla-titulaire.jpg"
import MorganeTitulaire from "/public/elues/ur/cfve/Morgane-titulaire.jpg"
import ValentinTitulaire from "/public/elues/ur/cfve/Valentin-titulaire.jpg"


export default function Elues() {
    return (
        <div className="flex flex-col items-center justify-start w-full px-4 md:px-8 lg:px-16">
            <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">Nos élu·e·s</h1>

            <div className="max-w-4xl w-full space-y-8 mb-20">

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Élu·e·s CROUS</h2>
                    <Image src={logoCrous} alt="Logo du Crous" className="w-32 h-auto"/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full h-full">

                        {/* Agathe */}
                        <EluCard elu={{
                            firstName: "Agathe",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire"
                        }}
                        picture={AgatheTitulaire} />

                        {/* Gurvan */}
                        <EluCard elu={{
                            firstName: "Gurvan",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire"
                        }}
                        picture={GurvanTitulaire} />

                        {/* Zoée */}
                        <EluCard elu={{
                            firstName: "Zoée",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire"
                        }}
                        picture={ZoeeTitulaire} />


                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Élu·e·s Université de Rennes 2</h2>
                    <Image src={logoUR2} alt="Logo de l'Université de Rennes 2" className="w-32 h-auto" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full h-full">

                        {/* Robin */}
                        <EluCard elu={{
                            firstName: "Robin",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire au Conseil d'Administration"
                        }}
                        picture={RobinTitulaire} />

                        {/* Eliott */}
                        <EluCard elu={{
                            firstName: "Eliott",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire à la Commission de la Formation et de la Vie universitaire"
                        }}
                        picture={EliottTitulaire} />

                        {/* Elisa */}
                        <EluCard elu={{
                            firstName: "Elisa",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire à la Commission de la Formation et de la Vie universitaire et de l'UFR STAPS"
                        }}
                        picture={ElisaTitulaire} />

                        {/* Anthony */}
                        <EluCard elu={{
                            firstName: "Anthony",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire de l'UFR STAPS"
                        }}
                        picture={AnthonyTitulaire} />
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Élu·e·s Université de Rennes</h2>
                    <Image src={logoUR} alt="Logo de l'Université de Rennes" className="w-32 h-auto" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full h-full">

                        {/* Mathilde */}
                        <EluCard elu={{
                            firstName: "Mathilde",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire au Conseil d'Administration"
                        }}
                        picture={MathildeTitulaire} />

                        {/* Ulysse */}
                        <EluCard elu={{
                            firstName: "Ulysse",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire au Conseil d'Administration"
                        }}
                        picture={UlysseTitulaire} />

                        {/* Carla */}
                        <EluCard elu={{
                            firstName: "Carla",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire à la Commission de la Formation et de la Vie Etudiante"
                        }}
                        picture={CarlaTitulaire} />

                        {/* Morgane */}
                        <EluCard elu={{
                            firstName: "Morgane",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire à la Commission de la Formation et de la Vie Etudiante"
                        }}
                        picture={MorganeTitulaire} />

                        {/* Valentin */}
                        <EluCard elu={{
                            firstName: "Valentin",
                            lastName: "N/A",
                            position: "Élu·e·s titulaire à la Commission de la Formation et de la Vie Etudiante"
                        }}
                        picture={ValentinTitulaire} />





                    </div>
                </section>



                
                {/* <section>
                    <h2 className="text-2xl font-semibold mb-4">Présentation</h2>
                    <p className="mb-4 italic">
                        La Fédération des associations générales étudiantes - FAGE - est la première organisation étudiante de France. Fondée en 1989, elle assoit son fonctionnement sur la démocratie participative et regroupe près de 2000 associations et syndicats, soit environ 300 000 étudiantEs.
                    </p>
                    <p className="mb-4">
                        La FAGE a pour but de garantir l'égalité des chances de réussite dans le système éducatif. C'est pourquoi elle agit pour l'amélioration constante des conditions de vie et d'études des jeunes en déployant des activités dans le champ de la représentation et de la défense des droits. En gérant des services et des œuvres répondant aux besoins sociaux, elle est également actrice de l'innovation sociale.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Reconnaissance et indépendance</h2>
                    <p className="mb-4">
                        La FAGE est reconnue organisation étudiante représentative par le Ministère chargé de l'enseignement supérieur. Indépendante des partis, des syndicats de salariés et des mutuelles étudiantes, elle base ses actions sur une démarche militante, humaniste et pragmatique. Partie prenante de l'économie sociale et solidaire, elle est par ailleurs agréée jeunesse et éducation populaire par le ministère chargé de la jeunesse.
                    </p>
                    <p className="mb-4">
                        À travers la FAGE, les jeunes trouvent un formidable outil citoyen pour débattre, entreprendre des projets et prendre des responsabilités dans la société.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Rôle et valeurs</h2>
                    <p className="mb-4">
                        La FAGE, en tant qu'organisation de jeunesse représentative des étudiantEs, s'affirme comme un acteur majeur de l'Éducation Populaire. Elle base ses initiatives sur les valeurs de solidarité et de progressisme. Face aux multiples défis et besoins sociaux des jeunes, la FAGE est tenue d'agir afin de répondre à leurs préoccupations et d'orienter les politiques publiques en faveur des jeunes et des étudiantEs.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Histoire</h2>
                    <p className="mb-4">
                        À la fin des années 80, l'idée de fonder une organisation germe à Lyon. Plusieurs réunions, se déroulant à Paris, mènent par la suite à l'assemblée constitutive de la FAGE le 20 novembre 1989, à la Faculté de pharmacie de Paris V. L'enjeu principal ? Obtenir une reconnaissance nationale et permettre aux associations étudiantes de dialoguer directement avec le ministère, en réponse à la loi d'orientation sur l'éducation du 10 juillet 1989.
                    </p>
                    <p className="mb-4">
                        Depuis lors, la FAGE a réalisé d'importantes avancées en faveur des étudiantEs et de la jeunesse, se positionnant comme l'unique héritière des AGE. Forte des membres de son réseau et de ses projets, la FAGE s'efforce quotidiennement de se perfectionner pour répondre aux besoins de la jeunesse.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Projet éducatif</h2>
                    <p className="mb-4">
                        Dans une volonté d'émancipation et de développement personnel, le projet éducatif, pour la deuxième fois depuis sa création, offre l'opportunité de découvrir ce que la FAGE a à offrir. Il vise à donner à chaque individu, quelles que soient ses responsabilités au sein de l'organisation, son niveau d'investissement et sa manière de s'engager, un repère pour donner du sens aux projets destinés à ses pairs.
                    </p>
                </section> */}
            </div>
        </div>
    );
}