import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { AssistanceForm } from "@/components/public/assistance/form"
import { getAssistanceConfig } from "@/helpers/assistanceConfig.server"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getConfig = createServerFn().handler(async () => {
    const result = await tryCatch(getAssistanceConfig())
    return result.success ? result.value : null
})

export const Route = createFileRoute("/_public/assistance/")({
    loader: async () => ({ config: await getConfig() }),
    head: () => ({
        meta: [
            { title: pageTitle("Défense des droits étudiants") },
            {
                name: "description",
                content:
                    "Besoin d'aide pour défendre vos droits étudiants ? Prenez contact avec vos éluEs étudiantEs !"
            },
            { name: "keywords", content: "défense, droit, étudiant, aide" }
        ]
    }),
    component: Assistance
})

function Assistance() {
    const { config } = Route.useLoaderData()

    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-12 text-center text-[3rem] font-semibold sm:py-20">
                Défense des droits étudiants
            </h1>
            <div className="mb-8 w-full max-w-3xl text-left">
                <p className="mb-4">
                    La FARE ouvre un guichet de défense des droits étudiants en
                    Haute-Bretagne. Que votre difficulté concerne votre
                    université ou se situe en dehors, des éluEs étudiantEs sont
                    là pour vous écouter, vous informer et vous accompagner.
                </p>
                <p className="mb-4">
                    Décrivez votre situation aussi clairement que possible :
                    cela nous aide à vous orienter rapidement. Toutes les
                    informations transmises restent{" "}
                    <strong>confidentielles</strong> et ne servent qu'au
                    traitement de votre demande.
                </p>
                {config && (
                    <p>
                        Délai de réponse moyen :{" "}
                        <strong>environ {config.delay}</strong>.
                    </p>
                )}
            </div>

            <AssistanceForm />
        </div>
    )
}
