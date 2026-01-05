import type { BTPTutorApplication as BTPTutorApplicationPrisma } from "@prisma/client"
import { Heading, Text } from "@react-email/components"
//biome-ignore lint/correctness/noUnusedImports: need to import react for react-email to work
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
            <Heading className="font-normal text-4xl text-stone-800">
                Candiudature reçue
            </Heading>
            <Text>
                Bonjour {firstName} {lastName},
            </Text>
            <Text>
                Merci pour l'intérêt que tu portes au projet, j'ai bien reçu ta
                candidature pour devenir tuteur pour l'année 2025-2026. Je
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
