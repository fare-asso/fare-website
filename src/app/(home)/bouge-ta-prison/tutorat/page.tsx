import Link from "next/link";

export default function Tutorat() {
    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="title">Devenir tuteur</h1>

            <div className="w-full max-w-4xl space-y-12">
                <section>
                    <h2>Présentation</h2>
                    <p className="mb-4">
                        La FAHB propose du tutorat méthodologique et
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
                    <h2 className="mb-4 text-2xl font-semibold">Candidature</h2>
                    <p className="mb-4">Pour candidater les prérequis sont :</p>
                    <ul className="mb-4 ml-4 list-inside list-disc space-y-2">
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
                </section>
            </div>
        </div>
    );
}
