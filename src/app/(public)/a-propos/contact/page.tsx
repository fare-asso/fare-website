import { ExternalLinkIcon, MailIcon } from "lucide-react"
import type { Metadata } from "next"
import { FaFacebook, FaInstagram } from "react-icons/fa6"

import ContactForm from "@/components/public/contact/contactForm"

export const metadata: Metadata = {
    title: "Contact"
}

const socialLinks = [
    {
        name: "Email",
        description: "contact@fare-asso.fr",
        href: "mailto:contact@fare-asso.fr",
        icon: MailIcon,
        iconColor: "text-[#4B6CB7]",
        borderColor: "border-[#4B6CB7]/40 hover:border-[#4B6CB7]"
    },
    {
        name: "Instagram",
        description: "@fare_hautebretagne",
        href: "https://www.instagram.com/fare_hautebretagne",
        icon: FaInstagram,
        iconColor: "text-[#E1306C]",
        borderColor: "border-[#E1306C]/40 hover:border-[#E1306C]"
    },
    {
        name: "Facebook",
        description: "fare.hautebretagne",
        href: "https://www.facebook.com/fare.hautebretagne",
        icon: FaFacebook,
        iconColor: "text-[#1877F2]",
        borderColor: "border-[#1877F2]/40 hover:border-[#1877F2]"
    }
] as const

export default function Contact() {
    return (
        <div className="mb-16 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Vous souhaitez nous contacter ?
            </h1>

            {/* Social links */}
            <div className="mb-12 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
                {socialLinks.map((link) => (
                    <a
                        key={link.name}
                        className={`group bg-card hover:bg-accent flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-colors ${link.borderColor}`}
                        href={link.href}
                        target={
                            link.href.startsWith("mailto:")
                                ? undefined
                                : "_blank"
                        }
                        rel={
                            link.href.startsWith("mailto:")
                                ? undefined
                                : "noopener noreferrer"
                        }
                    >
                        <link.icon
                            className={`size-8 ${link.iconColor} transition-transform group-hover:scale-110`}
                        />
                        <span className="text-sm font-medium">{link.name}</span>
                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            {link.description}
                            {!link.href.startsWith("mailto:") && (
                                <ExternalLinkIcon className="size-3" />
                            )}
                        </span>
                    </a>
                ))}
            </div>

            <ContactForm />
        </div>
    )
}
