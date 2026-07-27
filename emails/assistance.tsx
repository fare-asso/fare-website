import { Heading, Hr, Text } from "react-email"

import BaseTemplate from "./base"

interface AssistanceTemplateProps {
    prenom: string
    nom: string
    email: string
    etablissement: string
    ufr?: string
    situationLabel: string
    moyenContactLabel: string
    telephone?: string
    message: string
    hasAttachments: boolean
}

export function AssistanceTemplate({
    prenom,
    nom,
    email,
    etablissement,
    ufr,
    situationLabel,
    moyenContactLabel,
    telephone,
    message,
    hasAttachments
}: AssistanceTemplateProps) {
    return (
        <BaseTemplate>
            <Heading className="text-4xl font-normal text-stone-800">
                Nouvelle demande de défense des droits
            </Heading>
            <Text className="font-bold">
                {prenom} {nom}
                <span className="ml-2 text-stone-500">({email})</span>
            </Text>
            <Text>
                <strong>Situation :</strong> {situationLabel}
                <br />
                <strong>Établissement :</strong> {etablissement}
                {ufr ? (
                    <>
                        <br />
                        <strong>UFR / Composante :</strong> {ufr}
                    </>
                ) : null}
                <br />
                <strong>Recontact souhaité :</strong> {moyenContactLabel}
                {telephone ? (
                    <>
                        <br />
                        <strong>Téléphone :</strong> {telephone}
                    </>
                ) : null}
            </Text>
            <Hr />
            <Text className="whitespace-pre-line">{message}</Text>
            {hasAttachments ? (
                <Text className="text-sm text-stone-500">
                    Des pièces jointes sont incluses dans cet e-mail.
                </Text>
            ) : undefined}
        </BaseTemplate>
    )
}

AssistanceTemplate.PreviewProps = {
    prenom: "Marie",
    nom: "Durand",
    email: "marie.durand@etudiant.univ-rennes.fr",
    etablissement: "Université de Rennes",
    ufr: "UFR Droit et science politique",
    situationLabel: "À l'université / mon établissement",
    moyenContactLabel: "Email",
    message:
        "Bonjour, je rencontre un problème avec un·e enseignant·e concernant la notation d'un examen…",
    hasAttachments: true
} as AssistanceTemplateProps

export default AssistanceTemplate
