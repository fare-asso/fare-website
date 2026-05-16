import type { Metadata } from "next"
import prisma from "@/helpers/db"
import { AssistanceForm } from "./form"

export const metadata: Metadata = {
    title: "Défense des droits étudiants",
    description:
        "Besoin d'aide pour défendre vos droits étudiants ? Prenez contact avec vos éluEs étudiantEs !",
    keywords: "défense, droit, étudiant, aide"
}

export default async function Assistance() {
    const config =
        (await prisma.assistanceConfig.findFirst()) ??
        (await prisma.assistanceConfig.create({ data: {} }))

    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-12 text-center font-semibold text-[3rem] sm:py-20">
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
                <p>
                    Délai de réponse moyen :{" "}
                    <strong>environ {config.delay}</strong>.
                </p>
            </div>

            <AssistanceForm />
        </div>
    )
}
