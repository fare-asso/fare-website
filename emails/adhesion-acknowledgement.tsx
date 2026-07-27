import { Heading, Text } from "react-email"

import BaseTemplate from "./base"

interface AdhesionAckProps {
    associationName: string
}

export function AdhesionAck({ associationName }: AdhesionAckProps) {
    return (
        <BaseTemplate>
            <Heading className="text-4xl font-normal text-stone-800">
                Demande d'adhésion reçue
            </Heading>
            <Text>Bonjour,</Text>
            <Text>
                Nous avons bien reçu la demande d'adhésion de l'association{" "}
                <strong>{associationName}</strong> à la FARE. Merci !
            </Text>
            <Text>
                Nous allons étudier votre dossier et reviendrons vers vous
                prochainement. Une fois votre demande validée, vous serez
                invitéEs à régler la cotisation.
            </Text>
            <Text>
                Pour toute question, vous pouvez nous écrire à{" "}
                <span className="text-stone-600">secretariat@fare-asso.fr</span>
                .
            </Text>
            <Text>
                À bientôt, <br />
                Le Secrétariat Général de la FARE
            </Text>
        </BaseTemplate>
    )
}

AdhesionAck.PreviewProps = {
    associationName: "BDE test"
} as AdhesionAckProps

export default AdhesionAck
