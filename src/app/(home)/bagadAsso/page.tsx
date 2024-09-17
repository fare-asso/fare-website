import BagadAssoForm from "@/components/public/bagadAsso/form";
import prisma from "@/helpers/db";

export default async function BagadAsso() {

    const equipmentList = await prisma.bagadAssoEquipment.findMany();

    return(
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-12 sm:py-24 md:py-32 lg:py-44 text-[3rem] font-semibold">{"Bagad'Asso"}</h1>

            {/* Présentation du projet */}
            <div className="max-w-4xl text-justify mb-12 rounded-xl bg-black text-white p-8">
                <h2 className="text-xl font-semibold mb-4">Présentation du projet</h2>
                <p className="mb-4">
                    La FAHB et son réseau sont aujourd'hui des acteurs primordiaux pour la vie étudiante du territoire de Haute Bretagne. Parmi la vingtaine d'associations du réseau, plusieurs ont parmi leurs missions la réalisation d'évènements de cohésion et de rencontre, mais aussi de réduire l'isolement social des jeunes, de plus en plus présent durant ces dernières années.
                </p>
                <p className="mb-4">
                    Dans ce contexte, et afin d'accompagner et de permettre aux associations de son réseau de se développer et de réaliser des projets à hauteur de leurs ambitions, la FAHB vous présente le Bagad'Asso.
                </p>
                <p className="mb-4 italic">
                    Mais ça veut dire quoi "Bagad'Asso" ? Un Bagad c'est un orchestre traditionnel breton, alors cette fois-ci on remplace les musiciens par des associatifs et le public par nos étudiant.e.s breton.ne.s !
                </p>
                <p className="mb-4">
                    Cette malle à disposition des associations du réseau de la FAHB a pour objectif de mettre à disposition de manière gratuite du matériel d'événementiel et de prévention pour la réalisation de vos évènements. Concrètement, ça veut dire que lorsque vous souhaitez organiser votre WEC, gala, soirée ou quelconque évènement, vous nous dites "On aurait besoin d'une enceinte, un jeu de lumière et un tapis rouge, c'est possible ?", on vérifie que personne ne les a déjà réservé, si c'est tout bon on ne vous demande qu'une caution et hop c'est à vous pour l'évent !
                </p>
                <p>
                    Nous avons construit cette malle en 2 volets, inséparables pour le bon déroulement de vos évènements :
                </p>
            </div>

            <section className="w-full max-w-4xl mb-12">
                <h2 className="text-2xl font-bold mb-4">Nos services</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Logistique</h3>
                        <ul className="list-disc list-inside">
                            <li>Enceinte</li>
                            <li>Jeu de lumières</li>
                            <li>Tapis rouge</li>
                            <li>Machine à fumée</li>
                            <li>Platines DJ</li>
                            <li>Mégaphone</li>
                            <li>Talkies-Walkies</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Prévention</h3>
                        <ul className="list-disc list-inside">
                            <li>Préservatifs</li>
                            <li>Capotes de verre</li>
                            <li>Boules quies</li>
                            <li>Ethylotest</li>
                            <li>Éthylomètre</li>
                            <li>Flyers sensibilisation drogues</li>
                            <li>Trousse de secours</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Services</h3>
                        <ul className="list-disc list-inside">
                            <li>Trusted People (oui des gens)</li>
                            <li>Tarif réduit sur la SACEM</li>
                            <li>Tarifs réduits sur les goodies</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Formulaire de demande de matériel */}
            <BagadAssoForm equipmentList={equipmentList} />
            
        </div>
        
    )
}