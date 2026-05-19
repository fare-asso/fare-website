import React from "react"
import { Heading, Link, Text } from "react-email"

import BaseTemplate, { APP_URL } from "./base"

interface WelcomeTemplateProps {
    associationName: string
}

export function AdhesionTemplate({ associationName }: WelcomeTemplateProps) {
    return (
        <BaseTemplate>
            <Heading className="text-4xl font-normal text-stone-800">
                Nouvelle demande d'adhésion
            </Heading>
            <Text>
                Une nouvelle adhésion a été reçue pour l'association{" "}
                <strong>{associationName}</strong>.
            </Text>
            <Text>
                Vous pouvez consulter les détails de cette adhésion dans le{" "}
                <Link
                    href={`${APP_URL}/dashboard/adhesions`}
                    className="underline"
                >
                    tableau de bord des adhésions
                </Link>
                .
            </Text>
        </BaseTemplate>
    )
}

AdhesionTemplate.PreviewProps = {
    associationName: "BDE test"
} as WelcomeTemplateProps

export default AdhesionTemplate
