import type { Metadata } from "next"
import Link from "next/link"
import TutorApplicationForm from "./TutorApplicationForm"

export const metadata: Metadata = {
    title: "Devenir tuteur Bouge ta Prison"
}

export default function Tutorat() {
    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="title">Devenir tuteur</h1>

            <div className="w-full max-w-4xl space-y-12">
                <section>
                    <h2>Présentation</h2>
                    <p className="mb-4">
                        La FARE propose du tutorat méthodologique et
                        disciplinaire aux étudiants sous main de justice qui
                        souhaitent commencer ou reprendre des études
                        universitaires. Un binôme de tuteurs accompagne un
                        étudiant sous main de justice tout au long de l'année
                        scolaire à compter d' 1h30 toutes les deux semaines hors
                        vacances scolaires soit à la prison des femmes de
                        Rennes, soit à la prison des hommes de Vezin-Le-Coquet.
                        Au moins un des deux tuteurs doit être dans la même
                        filière que l'étudiant. Afin de mener à bien cet
                        accompagnement, le tutorat sera précédé d'une formation
                        en septembre de quelques heures.
                    </p>
                </section>

                <section>
                    <h2>Valorisation de l'Engagement Étudiant</h2>
                    <p className="mb-4">
                        Les contraintes horaires qui pourront être rencontrées
                        avec l'emploi du temps seront justifiées par une
                        dispense d'assiduité. Cet engagement peut être valorisé
                        à l'<strong>Université de Rennes 2</strong> dans le
                        cadre de la validation de l'engagement étudiant (VEE).
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 font-semibold text-2xl">Candidature</h2>
                    <p className="mb-4">Pour candidater les prérequis sont :</p>
                    <ul className="mb-8 ml-4 list-inside list-disc space-y-2">
                        <li>
                            être <strong>minimum en L3</strong> sur l'année
                            <strong> 2025-2026</strong>
                        </li>
                        <li>
                            être <strong>étudiant à Rennes</strong>
                        </li>
                        <li>
                            disposer d'un{" "}
                            <strong>casier judiciaire vierge</strong>
                        </li>
                    </ul>
                    <p className="mb-4">
                        Si vous ne connaissez pas actuellement votre lieu
                        d'étude pour l'année prochaine (candidature master) ou
                        votre année d'étude (redoublement), vous pouvez tout de
                        même candidater, il s'agira de confirmer votre
                        engagement ou non au moment des résultats. Les étudiants
                        en année de césure ne sont pas acceptés.
                    </p>
                    <p className="mb-4">
                        N'hésitez pas à nous envoyer vos questions.
                    </p>
                    <p className="mb-4">
                        Si vous êtes intéressés pour candidater pour l'année
                        2025-2026, merci de remplir le formulaire et de déposer
                        <strong> obligatoirement</strong> votre CV et lettre de
                        motivation.
                    </p>

                    <p className="mb-4">
                        Vous avez jusqu'au 30 mai pour postuler.
                    </p>

                    {/* Intéressé pour devenir tuteur? */}
                    <div className="flex h-auto w-full flex-col items-center py-4 pb-8!">
                        <div className="flex w-full flex-col rounded-xl bg-black p-8 text-white md:w-3/4">
                            <h2 className="mb-2 font-semibold text-lg">
                                Vous avez des questions ?
                            </h2>
                            <p>
                                Vous vous demandez si vous êtes éligible pour le
                                tutorat ? Vous avez des questions sur le
                                processus de candidature ? Vous souhaitez en
                                savoir plus ?
                            </p>
                            <Link
                                href="/bouge-ta-prison/tutorat/question"
                                className="mt-4 ml-auto w-full rounded-full border-white bg-white px-4 py-2 text-center font-semibold text-black transition-all hover:scale-105 md:w-1/3"
                            >
                                J'ai une question
                            </Link>
                        </div>
                    </div>

                    <TutorApplicationForm />
                </section>
            </div>
        </div>
    )
}
