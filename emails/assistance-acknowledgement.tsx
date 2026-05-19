import { Heading, Text } from "react-email"
import React from "react"

import BaseTemplate from "./base"

interface AssistanceAckProps {
    situationLabel: string
    delay: string
}

export function AssistanceAck({ situationLabel, delay }: AssistanceAckProps) {
    return (
        <BaseTemplate>
            <Heading className="text-4xl font-normal text-stone-800">
                Demande bien reçue
            </Heading>
            <Text>Bonjour,</Text>
            <Text>
                Nous avons bien reçu votre demande concernant :{" "}
                <strong>{situationLabel}</strong>.
            </Text>
            <Text>
                UnE éluE étudiantE de la FARE revient vers vous sous environ{" "}
                <strong>{delay}</strong>. Vos informations restent
                confidentielles.
            </Text>
            <Text>
                À bientôt, <br />
                Les éluEs étudiantEs de la FARE
            </Text>
        </BaseTemplate>
    )
}

AssistanceAck.PreviewProps = {
    situationLabel: "À l'université / mon établissement",
    delay: "48h"
} as AssistanceAckProps

export default AssistanceAck
