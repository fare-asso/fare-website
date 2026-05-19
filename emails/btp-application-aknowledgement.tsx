import type { BTPTutorApplication as BTPTutorApplicationPrisma } from "@prisma/client"
import { Heading, Text } from "@react-email/components"
import React from "react"

import BaseTemplate from "./base"

type BtpApplicationAckProps = Pick<
    BTPTutorApplicationPrisma,
    "firstName" | "lastName" | "email"
>

export function BtpApplicationAck({
    firstName,
    lastName,
    email
}: BtpApplicationAckProps) {
    return (
        <BaseTemplate>
            <Heading className="text-4xl font-normal text-stone-800">
                Candiudature reçue
            </Heading>
            <Text>
                Bonjour {firstName} {lastName},
            </Text>
            <Text>
                Merci pour l'intérêt que tu portes au projet, j'ai bien reçu ta
                candidature pour devenir tuteur pour l'année 2026-2027. Je
                reviens vers toi prochainement à l'adresse{" "}
                <span className="text-stone-600">{email}</span>.
            </Text>
            <Text>
                A bientôt, <br />
                L'équipe Bouge Ta Prison
            </Text>
        </BaseTemplate>
    )
}

BtpApplicationAck.PreviewProps = {
    firstName: "Marie",
    lastName: "Durand",
    email: "marie.durand@gmail.com"
} as BtpApplicationAckProps

export default BtpApplicationAck
