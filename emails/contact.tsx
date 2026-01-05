import { Heading, Text } from "@react-email/components"
//biome-ignore lint/correctness/noUnusedImports: need to import react for react-email to work
import React from "react"
import type { Contact } from "@/schemas/contact"
import BaseTemplate from "./base"

export function ContactTemplate({
    firstName,
    lastName,
    email,
    message
}: Contact) {
    return (
        <BaseTemplate>
            <Heading className="font-normal text-4xl text-stone-800">
                Nouveau message de contact
            </Heading>
            <Text className="font-bold">
                De : {firstName} {lastName}
                <span className="ml-2 text-stone-500">({email})</span>
            </Text>
            <Text>{message}</Text>
        </BaseTemplate>
    )
}

ContactTemplate.PreviewProps = {
    firstName: "Marie",
    lastName: "Durand",
    email: "marie.durand@gmail.com",
    message:
        "Bonjour, j'ai une question. Comment qu'on fait pour être étudiant??"
} as Contact

export default ContactTemplate
