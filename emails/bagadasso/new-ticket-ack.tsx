import {
    CodeInline,
    Column,
    Heading,
    Hr,
    Link,
    Row,
    Section,
    Text
} from "react-email"

import { formatEventDateRange } from "@/helpers/eventDate"

import BaseTemplate, { APP_URL } from "../base"

interface NewBagadAssoTicketAckProps {
    data: {
        association: string
        eventDate: Date
        eventEndDate: Date | null
        eventName: string
        eventType: string
        eventAddr: string
        estimatedParticipants: number
        representativeEmail: string
        equipments: {
            name: string
            quantity: number
        }[]
        secret?: string
    }
}

export function NewBagadAssoTicketAck({
    data: {
        association,
        eventDate,
        eventEndDate,
        eventName,
        eventType,
        eventAddr,
        estimatedParticipants,
        representativeEmail,
        equipments,
        secret
    }
}: NewBagadAssoTicketAckProps) {
    return (
        <BaseTemplate>
            <Section className="mt-8">
                <Text className="m-0 text-sm font-medium tracking-wider text-blue-600 uppercase">
                    Demande de prêt de matériel
                </Text>
                <Heading className="m-0 mt-2 text-3xl font-semibold text-stone-800">
                    Bagad'Asso
                </Heading>
            </Section>

            <Section>
                <Text className="m-0 mt-1 text-sm text-stone-700">
                    Nous avons bien reçu votre demande de prêt de matériel.
                </Text>

                {secret && (
                    <>
                        <Text className="m-0 mt-4 text-sm text-stone-700">
                            Vous pouvez consulter et modifier votre demande
                            directement sur{" "}
                            <Link href={`${APP_URL}/projets/bagad-asso`}>
                                {APP_URL}/projets/bagad-asso
                            </Link>
                            , en utilisant le code{" "}
                            <CodeInline className="rounded-[6px] bg-gray-200 px-2 py-0.5">
                                {secret}
                            </CodeInline>
                            .
                        </Text>

                        <Text className="m-0 mt-6 text-sm text-stone-700">
                            La modification est possible uniquement jusqu'à ce
                            que le contrat soit signé.
                        </Text>
                    </>
                )}

                <Text className="m-0 mt-6 text-sm text-stone-700">
                    Pour rappel, voici les détails de votre demande :
                </Text>
            </Section>

            <Section className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-6">
                <Text className="m-0 text-lg font-semibold text-stone-800">
                    {eventName}
                </Text>
                <Text className="m-0 mt-1 text-sm text-stone-500">
                    {eventType}
                </Text>

                <Hr className="my-4 border-stone-200" />

                <Row>
                    <Column className="w-1/2">
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Date
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            {formatEventDateRange(eventDate, eventEndDate)}
                        </Text>
                    </Column>
                    <Column className="w-1/2">
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Participants
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            ~{estimatedParticipants} personnes
                        </Text>
                    </Column>
                </Row>

                <Row className="mt-4">
                    <Column>
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Lieu
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            {eventAddr}
                        </Text>
                    </Column>
                </Row>

                <Hr className="my-4 border-stone-200" />

                <Row className="">
                    <Column>
                        <Text className="mx-0 mb-2 text-xs font-semibold tracking-wide text-stone-700 uppercase">
                            Matériel demandé
                        </Text>
                        {equipments.map((equipment) => (
                            <Text
                                key={equipment.name}
                                className="m-0 font-medium tracking-wide text-stone-700"
                            >
                                <span className="text-stone-500">
                                    {equipment.quantity}x{" "}
                                </span>
                                {equipment.name}
                            </Text>
                        ))}
                    </Column>
                </Row>
            </Section>

            <Section className="mt-4 rounded-xl border border-stone-200 p-6">
                <Row>
                    <Column className="w-1/2">
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Association
                        </Text>
                        <Text className="m-0 mt-1 text-sm font-medium text-stone-700">
                            {association}
                        </Text>
                    </Column>
                    <Column className="w-1/2">
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Contact
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            <Link
                                href={`mailto:${representativeEmail}`}
                                className="text-blue-600 no-underline"
                            >
                                {representativeEmail}
                            </Link>
                        </Text>
                    </Column>
                </Row>
            </Section>

            <Section className="mt-8 text-center">
                <Link
                    href={`${APP_URL}/projets/bagad-asso`}
                    className="inline-block rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white no-underline"
                >
                    Voir le ticket complet
                </Link>
            </Section>
        </BaseTemplate>
    )
}

NewBagadAssoTicketAck.PreviewProps = {
    data: {
        association: "BDE Pharma",
        eventDate: new Date("2025-03-15"),
        eventEndDate: new Date("2025-03-16"),
        eventName: "Soirée d'intégration",
        eventType: "Soirée étudiante",
        eventAddr: "Salle des fêtes, 12 rue de la République, Rennes",
        estimatedParticipants: 150,
        representativeEmail: "contact@bde-pharma.fr",
        equipments: [
            {
                name: "Projecteur",
                quantity: 1
            },
            {
                name: "Micro",
                quantity: 1
            }
        ],
        secret: "6c46171e-50e0eae3fdf7"
    }
} satisfies NewBagadAssoTicketAckProps

export default NewBagadAssoTicketAck
