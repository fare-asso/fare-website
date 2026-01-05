import { Heading, Hr, Link, Text } from "@react-email/components"
//biome-ignore lint/correctness/noUnusedImports: need to import react for react-email to work
import React from "react"
import type { BTPTutorApplication } from "@/schemas/bougeTaPrison"
import BaseTemplate, { APP_URL } from "./base"

type BtpApplicationProps = {
    data: Omit<BTPTutorApplication, "cv" | "motivationLetter">
}

export function BtpApplication({
    data: { firstName, lastName, email, major, studyYear }
}: BtpApplicationProps) {
    return (
        <BaseTemplate>
            <Heading className="font-normal text-4xl text-stone-800">
                Nouvelle candidature de tutorat
            </Heading>
            <Text>
                {firstName} {lastName}
                <span className="ml-2 text-stone-500">({email})</span>
                <br />
                Études: {major} ({studyYear})
            </Text>
            <Hr />
            <Text>
                Trouve la candidature complète sur le{" "}
                <Link
                    href={`${APP_URL}/dashboard/bouge-ta-prison?tab=candidatures`}
                    className="underline"
                >
                    tableau de bord Bouge Ta Prison
                </Link>
                .
            </Text>
        </BaseTemplate>
    )
}

BtpApplication.PreviewProps = {
    data: {
        firstName: "Marie",
        lastName: "Dupont",
        email: "marie.dupont@example.com",
        major: "Pharma",
        studyYear: "L3"
    }
} as BtpApplicationProps

export default BtpApplication
