import { Heading, Hr, Link, Text } from "@react-email/components"
//biome-ignore lint/correctness/noUnusedImports: need to import react for react-email to work
import React from "react"
import type { BTPTutorQuestion } from "@/schemas/bougeTaPrison"
import BaseTemplate, { APP_URL } from "./base"

type BtpContactProps = Omit<BTPTutorQuestion, "major" | "studyYear"> & {
    id: number
}

export function BtpContact({
    firstName,
    lastName,
    email,
    message,
    id
}: BtpContactProps) {
    return (
        <BaseTemplate>
            <Heading className="font-normal text-4xl text-stone-800">
                Nouvelle question BTP
            </Heading>
            <Text className="font-bold">
                De : {firstName} {lastName}
                <span className="ml-2 text-stone-500">({email})</span>
            </Text>
            <Text className="italic">{message}</Text>
            <Hr />
            <Text>
                Tu peux voir la demande de contact sur le{" "}
                <Link
                    href={`${APP_URL}/dashboard/bouge-ta-prison/questions/${id}`}
                    className="underline"
                >
                    tableau de bord Bouge Ta Prison
                </Link>
                .
            </Text>
        </BaseTemplate>
    )
}

BtpContact.PreviewProps = {
    firstName: "Marie",
    lastName: "Durand",
    email: "marie.durand@gmail.com",
    message: "Bonjour, j'ai une question"
} as BtpContactProps

export default BtpContact
