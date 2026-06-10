import {
    ExternalLinkIcon,
    FileTextIcon,
    LinkIcon,
    type LucideIcon,
    MailIcon
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import type { IconType } from "react-icons"
import {
    FaDiscord,
    FaEnvelope,
    FaFacebook,
    FaInstagram,
    FaLinkedin
} from "react-icons/fa6"

import prisma from "@/helpers/db"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export const metadata: Metadata = {
    title: "Liens",
    description: " Les liens utiles de la FARE"
}

const socialLinks: { name: string; href: string; icon: IconType }[] = [
    {
        name: "Instagram",
        href: "https://www.instagram.com/fare_hautebretagne",
        icon: FaInstagram
    },
    {
        name: "Email",
        href: "mailto:contact@fare-asso.fr",
        icon: FaEnvelope
    },
    {
        name: "Facebook",
        href: "https://www.facebook.com/fare.hautebretagne",
        icon: FaFacebook
    },
    {
        name: "Linkedin",
        href: "https://www.linkedin.com/company/fare-haute-bretagne",
        icon: FaLinkedin
    },
    {
        name: "Discord",
        href: "https://discord.gg/4DaBP3Vw59",
        icon: FaDiscord
    }
]

function isExternal(url: string): boolean {
    return /^(https?:|mailto:|tel:)/.test(url)
}

// Fonction auxiliaire pour ouvrir les liens dans une nouvelle fenetre
function newTabProps(url: string): { target?: string; rel?: string } {
    return /^https?:/.test(url)
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {}
}

// Icone adaptatif en fonction de l'url
function getLinkIcon(url: string): LucideIcon {
    if (url.startsWith("mailto:")) return MailIcon
    if (/\.pdf(\?|#|$)/i.test(url)) return FileTextIcon
    if (isExternal(url)) return ExternalLinkIcon
    return LinkIcon
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
        <div className="flex w-full max-w-lg flex-col items-center gap-8 py-8 sm:py-12">
            <header className="flex flex-col items-center gap-3 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    @fare_hautebretagne
                </h1>
                <p className="text-muted-foreground max-w-xs text-sm font-medium">
                    Fédération des Associations du Réseau Étudiant de Haute
                    Bretagne (FARE)
                </p>
            </header>

            {/* Social links */}
            <nav className="flex flex-wrap items-center justify-center gap-6">
                {socialLinks.map((social) => (
                    <Link
                        key={social.name}
                        href={social.href}
                        title={social.name}
                        aria-label={social.name}
                        className="text-foreground transition-transform hover:scale-110 hover:opacity-70"
                        {...newTabProps(social.href)}
                    >
                        <social.icon className="size-6" />
                    </Link>
                ))}
            </nav>
            {categories.length > 0 ? (
                <div className="flex w-full flex-col gap-8">
                    {categories.map((category) => (
                        <section
                            key={category.id}
                            className="flex flex-col gap-3"
                        >
                            <h2 className="text-center text-lg font-semibold">
                                {category.name}
                            </h2>
                            <div className="flex flex-col gap-3">
                                {category.liens.map((link) => {
                                    const Icon = getLinkIcon(link.url)
                                    return (
                                        <Link
                                            key={link.id}
                                            href={link.url}
                                            className="group bg-card relative flex items-center rounded-xl border p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
                                            {...newTabProps(link.url)}
                                        >
                                            <Icon className="text-muted-foreground absolute left-4 size-5" />
                                            <span className="flex-1 px-9 text-center font-medium">
                                                {link.label}
                                            </span>
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
