import { Heading, Hr, Link, Text } from "react-email"

import type { TRemboursementForm } from "@/schemas/remboursement"

import BaseTemplate, { APP_URL } from "./base"

interface RemboursementTemplateProps {
    prenom: string
    nom: string
    email: string
    demandeur: TRemboursementForm["demandeur"]
    association?: string
    type: TRemboursementForm["type"]
}

export function RemboursementTemplate({
    prenom,
    nom,
    email,
    demandeur,
    association,
    type
}: RemboursementTemplateProps) {
    return (
        <BaseTemplate>
            <Heading className="text-4xl font-normal text-stone-800">
                Nouvelle demande de remboursement
            </Heading>
            <Text className="font-bold">
                {prenom} {nom}
                <span className="ml-2 text-stone-500">({email})</span>
            </Text>
            <Text>
                <strong>Profil :</strong>{" "}
                {demandeur === "bureauTerritorial" &&
                    "Membre du Bureau Territorial"}
                {demandeur === "equipeTerritoriale" &&
                    "Membre de l'Équipe Territoriale"}
                {demandeur === "adminFARE" && "Administrateur·ice de la FARE"}
                {demandeur === "adminFARE" && association ? (
                    <>
                        <br />
                        <strong>Association :</strong> {association}
                    </>
                ) : undefined}
                <br />
                <strong>Type de demande :</strong>{" "}
                {type === "train" && "Déplacement en train"}
                {type === "voiture" && "Déplacement en voiture"}
                {type === "metroBus" && "Tickets de métro / bus"}
                {type === "car" && "Déplacement en car"}
                {type === "achat" && "Achat avec facture"}
            </Text>
            <Hr />
            <Text>
                Vous pouvez consulter les détails et les justificatifs de cette
                demande dans le{" "}
                <Link
                    href={`${APP_URL}/dashboard/remboursements`}
                    className="underline"
                >
                    tableau de bord des remboursements
                </Link>
                .
            </Text>
        </BaseTemplate>
    )
}

RemboursementTemplate.PreviewProps = {
    prenom: "Marie",
    nom: "Durand",
    email: "marie.durand@fare-asso.fr",
    demandeur: "adminFARE",
    association: "BDE Rennes",
    type: "train"
} as RemboursementTemplateProps

export default RemboursementTemplate
