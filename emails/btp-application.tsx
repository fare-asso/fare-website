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
import type { BTPTutorApplication } from "@/schemas/bougeTaPrison"
import BaseTemplate, { APP_URL } from "./base"

type BtpApplicationProps = {
    data: Omit<BTPTutorApplication, "cv" | "motivationLetter">
}

export function BtpApplication({
    data: { firstName, lastName, email, major, studyYear }
}: BtpApplicationProps) {
    return (
        <BaseTemplate>
            <Section className="mt-8">
                <Text className="m-0 font-medium text-blue-600 text-sm uppercase tracking-wider">
                    Nouvelle candidature
                </Text>
                <Heading className="m-0 mt-2 font-semibold text-3xl text-stone-800">
                    Bouge Ta Prison
                </Heading>
            </Section>

            <Section className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-6">
                <Text className="m-0 font-semibold text-lg text-stone-800">
                    {firstName} {lastName}
                </Text>
                <Text className="m-0 mt-1 text-sm text-stone-500">
                    Candidature au tutorat
                </Text>

                <Hr className="my-4 border-stone-200" />

                <Row>
                    <Column className="w-1/2">
                        <Text className="m-0 font-medium text-stone-400 text-xs uppercase tracking-wide">
                            Filière
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            {major}
                        </Text>
                    </Column>
                    <Column className="w-1/2">
                        <Text className="m-0 font-medium text-stone-400 text-xs uppercase tracking-wide">
                            Année d'études
                        </Text>
                        <Text className="m-0 mt-1 text-sm text-stone-700">
                            {studyYear}
                        </Text>
                    </Column>
                </Row>

                <Row className="mt-4">
                    <Column>
                        <Text className="m-0 font-medium text-stone-400 text-xs uppercase tracking-wide">
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
            </Section>

            <Section className="mt-8 text-center">
                <Link
                    href={`${APP_URL}/dashboard/bouge-ta-prison?tab=candidatures`}
                    className="inline-block rounded-lg bg-blue-500 px-6 py-3 font-semibold text-sm text-white no-underline"
                >
                    Voir la candidature complète
                </Link>
            </Section>

            <Text className="mt-6 text-center text-sm text-stone-400">
                Le CV et la lettre de motivation sont disponibles dans le
                tableau de bord.
            </Text>
        </BaseTemplate>
    )
}

BtpApplication.PreviewProps = {
    data: {
        firstName: "Marie",
        lastName: "Dupont",
        email: "marie.dupont@example.com",
        major: "Pharma",
        studyYear: "L3"
    }
} as BtpApplicationProps

export default BtpApplication
