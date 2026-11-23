import { Heading, Text } from "react-email"

import type { TRemboursementForm } from "@/schemas/remboursement"

import BaseTemplate from "./base"

interface RemboursementAckProps {
    prenom: string
    type: TRemboursementForm["type"]
}

export function RemboursementAck({ prenom, type }: RemboursementAckProps) {
    return (
        <BaseTemplate>
            <Heading className="text-4xl font-normal text-stone-800">
                Demande de remboursement reçue
            </Heading>
            <Text>Bonjour {prenom},</Text>
            <Text>
                Nous avons bien reçu votre demande de remboursement pour{" "}
                <strong>
                    {type === "train" && "un déplacement en train"}
                    {type === "voiture" && "un déplacement en voiture"}
                    {type === "metroBus" && "des tickets de métro / bus"}
                    {type === "car" && "un déplacement en car"}
                    {type === "achat" && "un achat avec facture"}
                </strong>
                .
            </Text>
            <Text>
                La Trésorerie de la FARE va vérifier vos justificatifs et
                procéder au remboursement dans les meilleurs délais.
            </Text>
            <Text>
                Pour toute question, vous pouvez directement répondre à ce mail
                ou nous écrire à{" "}
                <a
                    className="text-stone-600"
                    href="mailto:tresorerie@fare-asso.fr"
                >
                    tresorerie@fare-asso.fr
                </a>
                .
            </Text>
            <Text>
                À bientôt, <br />
                La Trésorerie de la FARE
            </Text>
        </BaseTemplate>
    )
}

RemboursementAck.PreviewProps = {
    prenom: "Marie",
    type: "train"
} as RemboursementAckProps

export default RemboursementAck
