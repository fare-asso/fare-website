import React from "react"
import { Column, Heading, Hr, Link, Row, Section, Text } from "react-email"

import BaseTemplate, { APP_URL } from "../base"

interface NewBagadAssoSuggestionProps {
    data: {
        id: number
        equipmentName: string
        equipmentType: string
        referenceUrl: string | null
        associationName: string
        firstName: string
        lastName: string
        position: string
        contactEmail: string
        details: string
    }
}

export function NewBagadAssoSuggestion({
    data: {
        id,
        equipmentName,
        equipmentType,
        referenceUrl,
        associationName,
        firstName,
        lastName,
        position,
        contactEmail,
        details
    }
}: NewBagadAssoSuggestionProps) {
    return (
        <BaseTemplate>
            <Section className="mt-8">
                <Text className="m-0 text-sm font-medium tracking-wider text-blue-600 uppercase">
                    Nouvelle suggestion #{id}
                </Text>
                <Heading className="m-0 mt-2 text-3xl font-semibold text-stone-800">
                    Bagad'Asso
                </Heading>
            </Section>

            <Section className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-6">
                <Text className="m-0 text-lg font-semibold text-stone-800">
                    {equipmentName}
                </Text>
                <Text className="m-0 mt-1 text-sm text-stone-500">
                    {equipmentType}
                </Text>

                {referenceUrl ? (
                    <>
                        <Hr className="my-4 border-stone-200" />
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Référence
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            <Link
                                href={referenceUrl}
                                className="text-blue-600 no-underline"
                            >
                                {referenceUrl}
                            </Link>
                        </Text>
                    </>
                ) : null}

                {details ? (
                    <>
                        <Hr className="my-4 border-stone-200" />
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Précisions
                        </Text>
                        <Text className="m-0 mt-1 text-sm whitespace-pre-line text-stone-700">
                            {details}
                        </Text>
                    </>
                ) : null}
            </Section>

            <Section className="mt-4 rounded-xl border border-stone-200 p-6">
                <Row>
                    <Column className="w-1/2">
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Association
                        </Text>
                        <Text className="m-0 mt-1 text-sm font-medium text-stone-700">
                            {associationName}
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-500">
                            {firstName} {lastName}, {position}
                        </Text>
                    </Column>
                    <Column className="w-1/2">
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Contact
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            <Link
                                href={`mailto:${contactEmail}`}
                                className="text-blue-600 no-underline"
                            >
                                {contactEmail}
                            </Link>
                        </Text>
                    </Column>
                </Row>
            </Section>

            <Section className="mt-8 text-center">
                <Link
                    href={`${APP_URL}/dashboard/bagadAsso/suggestions`}
                    className="inline-block rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white no-underline"
                >
                    Voir les suggestions
                </Link>
            </Section>

            <Text className="mt-6 text-center text-sm text-stone-400">
                Vous pouvez archiver cette suggestion depuis le tableau de bord
                une fois traitée.
            </Text>
        </BaseTemplate>
    )
}

NewBagadAssoSuggestion.PreviewProps = {
    data: {
        id: 12,
        equipmentName: "Vidéoprojecteur",
        equipmentType: "Électronique",
        referenceUrl: "https://www.exemple.fr/videoprojecteur",
        associationName: "BDE Pharma",
        firstName: "Anna",
        lastName: "Le Goff",
        position: "Responsable évènementiel",
        contactEmail: "contact@bde-pharma.fr",
        details:
            "Pour projeter des films lors de nos soirées cinéma, environ une fois par mois."
    }
} satisfies NewBagadAssoSuggestionProps

export default NewBagadAssoSuggestion
