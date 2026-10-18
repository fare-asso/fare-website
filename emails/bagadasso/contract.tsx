import { Heading, Link, Section, Text } from "react-email"

import { formatEventDateRange } from "@/helpers/eventDate"

import BaseTemplate from "../base"

interface BagadAssoContractProps {
    data: {
        eventDate: Date
        eventEndDate: Date | null
        id: number
        includeCommunication?: boolean
        additionalParagraph?: string
    }
}

export function BagadAssoContract({
    data: {
        eventDate,
        eventEndDate,
        id,
        includeCommunication = true,
        additionalParagraph
    }
}: BagadAssoContractProps) {
    return (
        <BaseTemplate>
            <Section className="mt-8">
                <Text className="m-0 text-sm font-medium tracking-wider text-blue-600 uppercase">
                    Demande de prêt de matériel
                </Text>
                <Heading className="m-0 mt-2 text-3xl font-semibold text-stone-800">
                    Contrat Bagad'Asso #{id}
                </Heading>
            </Section>

            <Section className="mt-6 text-sm text-stone-700">
                <Text className="m-0">Bonjour,</Text>
                <Text className="m-0 mt-4">
                    J'ai bien reçu votre demande de prêt de matériel. Vous
                    trouverez en pièce jointe le{" "}
                    <span className="text-blue-600">contrat</span> de
                    réservation du Bagad'Asso, à compléter et à signer pour
                    votre événement{" "}
                    <span className="font-semibold lowercase">
                        {formatEventDateRange(eventDate, eventEndDate)}
                    </span>
                    .
                </Text>
            </Section>

            {additionalParagraph ? (
                <Section className="mt-6 text-sm text-stone-700">
                    <Text className="m-0">{additionalParagraph}</Text>
                </Section>
            ) : undefined}

            <Section className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-6">
                <Text className="m-0 text-sm font-semibold text-stone-800">
                    Vous trouverez également ci-après :
                </Text>
                <Text className="m-0 mt-4 text-sm text-stone-700">
                    • Le{" "}
                    <Link
                        href="https://drive.google.com/file/d/1I1B2b9P0KdvfSIsXLdtYaywS-ukYLB_9/view?usp=drive_link"
                        className="text-blue-600 underline"
                    >
                        kit d'utilisation du Bagad'Asso
                    </Link>
                    , qui présente le projet ainsi que le matériel mis à
                    disposition.
                </Text>
                {includeCommunication && (
                    <Text className="m-0 mt-3 text-sm text-stone-700">
                        • Le{" "}
                        <Link
                            href="https://drive.google.com/file/d/1dKGEMJq4Ds112bUn4CXyFrANxo2wstkq/view?usp=sharing"
                            className="text-blue-600 underline"
                        >
                            kit de communication
                        </Link>
                        , qui recense les règles à respecter pour communiquer
                        autour du projet, conformément au contrat.
                    </Text>
                )}
            </Section>

            <Section className="mt-6 text-sm text-stone-700">
                {includeCommunication && (
                    <>
                        <Text className="m-0">
                            Afin de vous faire gagner du temps, j'ai également
                            créé des modèles de communication sur Canva. Il vous
                            suffit d'ajouter votre photo ou votre vidéo pour que
                            votre story soit prête !
                        </Text>
                        <Text className="m-0 my-4">
                            Lien Canva :{" "}
                            <Link
                                href="https://canva.link/ge625su919wtyjz"
                                className="text-blue-600 underline"
                            >
                                https://canva.link/ge625su919wtyjz
                            </Link>
                        </Text>
                    </>
                )}
                <Text className="m-0 text-sm text-stone-700">
                    En règle générale, le matériel est remis un à deux jours
                    avant l'événement. N'hésitez pas à me communiquer le jour et
                    l'horaire qui vous conviendraient pour la remise du
                    matériel. Le retrait s'effectue dans notre local situé sur
                    le campus de Beaulieu.
                </Text>
            </Section>

            <Section className="mt-6 rounded-xl border border-stone-200 p-6">
                <Text className="m-0 text-sm font-medium text-stone-800">
                    Pensez à apporter le chèque de caution lors de la
                    récupération du matériel.
                </Text>
            </Section>

            <Section className="mt-6 text-sm text-stone-700">
                <Text className="m-0">
                    Si vous avez la moindre question, je reste à votre
                    disposition.
                </Text>
                <Text className="m-0 mt-4">À bientôt,</Text>
            </Section>
        </BaseTemplate>
    )
}

BagadAssoContract.PreviewProps = {
    data: {
        eventDate: new Date("2026-10-17"),
        eventEndDate: new Date("2026-10-18"),
        id: 67,
        additionalParagraph:
            "This is an additional paragraph containing a bit of testing text to fill in the content gap with some lorem ipsum whatever."
    }
} satisfies BagadAssoContractProps

export default BagadAssoContract
