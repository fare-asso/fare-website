import { ExternalLinkIcon, MailIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { FaDiscord, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa6"

import prisma from "@/helpers/db"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export const metadata: Metadata = {
    title: "Liens",
    description: " Les liens utiles de la FARE"
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
    },
    {
        name: "Linkedin",
        description: "fare-haute-bretagne",
        href: "https://www.linkedin.com/company/fare-haute-bretagne",
        icon: FaLinkedin,
        iconColor: "text-[#0077B5]",
        borderColor: "border-[#0077B5]/40 hover:border-[#0077B5]"
    },
    {
        name: "Discord",
        description: "Fare",
        href: "https://discord.gg/4DaBP3Vw59",
        icon: FaDiscord,
        iconColor: "text-[#7289DA]",
        borderColor: "border-[#7289DA]/40 hover:border-[#7289DA]"
    }
] as const

function isExternal(url: string): boolean {
    return /^(https?:|mailto:|tel:)/.test(url)
}

export default async function Liens() {
    const result = await tryCatch(
        prisma.linkCategory.findMany({
            include: {
                liens: {
                    orderBy: { order: "asc" }
                }
            },
            orderBy: { order: "asc" }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
    }
    const categories = result.success
        ? result.value.filter((category) => category.liens.length > 0)
        : []

    return (
        <div className="flex w-full flex-col items-center">
            <h1 className="py-12 text-center text-4xl font-bold sm:py-24">
                Vous souhaitez nous contacter ?
            </h1>

            {/* Social links */}
            <div className="flex flex-wrap justify-center gap-3">
                {socialLinks.map((link) => (
                    <Link
                        key={link.name}
                        className={`group bg-card hover:bg-accent flex w-50 flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-colors ${link.borderColor}`}
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
                    </Link>
                ))}
            </div>

            {categories.length > 0 ? (
                <div className="mt-16 flex w-full max-w-md flex-col gap-10">
                    {categories.map((category) => (
                        <section
                            key={category.id}
                            className="flex flex-col gap-3"
                        >
                            <h2 className="text-center text-xl font-semibold">
                                {category.name}
                            </h2>
                            <div className="flex flex-col gap-3">
                                {category.liens.map((link) => {
                                    const external = isExternal(link.url)
                                    return (
                                        <Link
                                            key={link.id}
                                            href={link.url}
                                            target={
                                                external ? "_blank" : undefined
                                            }
                                            rel={
                                                external
                                                    ? "noopener noreferrer"
                                                    : undefined
                                            }
                                            className="group bg-card hover:bg-accent flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-center font-medium transition-colors"
                                        >
                                            {link.label}
                                            {external ? (
                                                <ExternalLinkIcon className="text-muted-foreground size-4" />
                                            ) : null}
                                        </Link>
                                    )
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            ) : null}
        </div>
    )
}
