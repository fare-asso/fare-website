import React from "react"
import { Heading, Section, Text } from "react-email"

import BaseTemplate from "./base"

interface NewGoogleUserProps {
    email: string
    name: string
    loginDate: string
}

export function NewGoogleUserTemplate({
    email,
    name,
    loginDate
}: NewGoogleUserProps) {
    return (
        <BaseTemplate>
            <Heading className="text-4xl font-normal text-stone-800">
                Nouvelle connexion Google
            </Heading>
            <Text className="text-stone-600">
                Un nouvel utilisateur s'est connect&eacute; avec Google sur le
                site FARE.
            </Text>
            <Section className="rounded-lg bg-stone-100 p-4">
                <Text className="m-0">
                    <span className="font-semibold">Email :</span> {email}
                </Text>
                <Text className="m-0">
                    <span className="font-semibold">Nom :</span> {name}
                </Text>
                <Text className="m-0">
                    <span className="font-semibold">Date :</span> {loginDate}
                </Text>
            </Section>
            <Text className="text-stone-600">
                Pensez &agrave; configurer les permissions de cet utilisateur si
                n&eacute;cessaire.
            </Text>
        </BaseTemplate>
    )
}

NewGoogleUserTemplate.PreviewProps = {
    email: "jean.dupont@fare-asso.fr",
    name: "Jean Dupont",
    loginDate: "20/01/2026 14:30:00"
} as NewGoogleUserProps

export default NewGoogleUserTemplate
