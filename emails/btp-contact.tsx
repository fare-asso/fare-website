import {
    Column,
    Heading,
    Hr,
    Link,
    Row,
    Section,
    Text
} from "react-email"
import React from "react"

import type { BTPTutorQuestion } from "@/schemas/bougeTaPrison"

import BaseTemplate, { APP_URL } from "./base"

type BtpContactProps = Omit<
    BTPTutorQuestion,
    "major" | "studyYear" | "captchaToken"
> & {
    id: number
}

export function BtpContact({
    firstName,
    lastName,
    email,
    message,
    id
}: BtpContactProps) {
    return (
        <BaseTemplate>
            <Section className="mt-8">
                <Text className="m-0 text-sm font-medium tracking-wider text-blue-600 uppercase">
                    Question #{id}
                </Text>
                <Heading className="m-0 mt-2 text-3xl font-semibold text-stone-800">
                    Bouge Ta Prison
                </Heading>
            </Section>

            <Section className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-6">
                <Row>
                    <Column className="w-1/2">
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            De
                        </Text>
                        <Text className="m-0 mt-1 text-sm font-medium text-stone-700">
                            {firstName} {lastName}
                        </Text>
                    </Column>
                    <Column className="w-1/2">
                        <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                            Email
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            <Link
                                href={`mailto:${email}`}
                                className="text-blue-600 no-underline"
                            >
                                {email}
                            </Link>
                        </Text>
                    </Column>
                </Row>

                <Hr className="my-4 border-stone-200" />

                <Text className="m-0 text-xs font-medium tracking-wide text-stone-400 uppercase">
                    Message
                </Text>
                <Text className="m-0 mt-2 text-sm leading-relaxed text-stone-700">
                    {message}
                </Text>
            </Section>

            <Section className="mt-8 text-center">
                <Link
                    href={`${APP_URL}/dashboard/bouge-ta-prison/questions/${id}`}
                    className="inline-block rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white no-underline"
                >
                    Voir la question
                </Link>
            </Section>

            <Text className="mt-6 text-center text-sm text-stone-400">
                N'oublie pas de marquer la question comme traitée dans le
                dashboard une fois répondue!
            </Text>
        </BaseTemplate>
    )
}

BtpContact.PreviewProps = {
    firstName: "Marie",
    lastName: "Durand",
    email: "marie.durand@gmail.com",
    message:
        "Bonjour, j'aimerais en savoir plus sur le programme de tutorat. Comment puis-je m'inscrire et quelles sont les conditions requises ?",
    id: 42
} as BtpContactProps

export default BtpContact
