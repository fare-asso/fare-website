import {
    Column,
    Heading,
    Hr,
    Link,
    Row,
    Section,
    Text
} from "@react-email/components"

//biome-ignore lint/correctness/noUnusedImports: need to import react for react-email to work
import React from "react"
import BaseTemplate, { APP_URL } from "./base"

interface NewBagadAssoTicketProps {
    data: {
        id: number
        assocation: string
        eventDate: Date
        eventName: string
        eventType: string
        eventAddr: string
        estimatedParticipants: number
        representativeEmail: string
    }
}

export function NewBagadAssoTicket({
    data: {
        id,
        assocation,
        eventDate,
        eventName,
        eventType,
        eventAddr,
        estimatedParticipants,
        representativeEmail
    }
}: NewBagadAssoTicketProps) {
    return (
        <BaseTemplate>
            <Section className="mt-8">
                <Text className="m-0 font-medium text-blue-600 text-sm uppercase tracking-wider">
                    Nouveau ticket #{id}
                </Text>
                <Heading className="m-0 mt-2 font-semibold text-3xl text-stone-800">
                    Bagad'Asso
                </Heading>
            </Section>

            <Section className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-6">
                <Text className="m-0 font-semibold text-lg text-stone-800">
                    {eventName}
                </Text>
                <Text className="m-0 mt-1 text-sm text-stone-500">
                    {eventType}
                </Text>

                <Hr className="my-4 border-stone-200" />

                <Row>
                    <Column className="w-1/2">
                        <Text className="m-0 font-medium text-stone-400 text-xs uppercase tracking-wide">
                            Date
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            {new Date(eventDate).toLocaleDateString("fr-FR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            })}
                        </Text>
                    </Column>
                    <Column className="w-1/2">
                        <Text className="m-0 font-medium text-stone-400 text-xs uppercase tracking-wide">
                            Participants
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            ~{estimatedParticipants} personnes
                        </Text>
                    </Column>
                </Row>

                <Row className="mt-4">
                    <Column>
                        <Text className="m-0 font-medium text-stone-400 text-xs uppercase tracking-wide">
                            Lieu
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            {eventAddr}
                        </Text>
                    </Column>
                </Row>
            </Section>

            <Section className="mt-4 rounded-xl border border-stone-200 p-6">
                <Row>
                    <Column className="w-1/2">
                        <Text className="m-0 font-medium text-stone-400 text-xs uppercase tracking-wide">
                            Association
                        </Text>
                        <Text className="m-0 mt-1 font-medium text-sm text-stone-700">
                            {assocation}
                        </Text>
                    </Column>
                    <Column className="w-1/2">
                        <Text className="m-0 font-medium text-stone-400 text-xs uppercase tracking-wide">
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
                    href={`${APP_URL}/dashboard/bagadAsso/tickets/${id}`}
                    className="inline-block rounded-lg bg-blue-500 px-6 py-3 font-semibold text-sm text-white no-underline"
                >
                    Voir le ticket complet
                </Link>
            </Section>

            <Text className="mt-6 text-center text-sm text-stone-400">
                Les informations complètes sont dans le tableau de bord.
            </Text>
        </BaseTemplate>
    )
}

NewBagadAssoTicket.PreviewProps = {
    data: {
        assocation: "BDE Pharma",
        eventDate: new Date("2025-03-15"),
        eventName: "Soirée d'intégration",
        eventType: "Soirée étudiante",
        eventAddr: "Salle des fêtes, 12 rue de la République, Rennes",
        estimatedParticipants: 150,
        representativeEmail: "contact@bde-pharma.fr",
        id: 81
    }
} as NewBagadAssoTicketProps

export default NewBagadAssoTicket
