import { Heading, Text } from "react-email"
import React from "react"

import type { Contact } from "@/schemas/contact"

import BaseTemplate from "./base"

type ContactTemplateProps = Omit<Contact, "captchaToken">

export function ContactTemplate({
    firstName,
    lastName,
    email,
    message
}: ContactTemplateProps) {
    return (
        <BaseTemplate>
            <Heading className="text-4xl font-normal text-stone-800">
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
} as ContactTemplateProps

export default ContactTemplate
