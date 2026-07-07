import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import {
    ExternalLinkIcon,
    FileTextIcon,
    LinkIcon,
    type LucideIcon,
    MailIcon
} from "lucide-react"
import type { IconType } from "react-icons"
import {
    FaDiscord,
    FaEnvelope,
    FaFacebook,
    FaInstagram,
    FaLinkedin
} from "react-icons/fa6"

import Link from "@/components/link"
import prisma from "@/helpers/db"
import { captureActionError } from "@/lib/sentry"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

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
    return !url.startsWith("https://fare-asso.fr/")
}

function isPdf(url: string): boolean {
    return /\.pdf(\?|#|$)/i.test(url)
}

function getLinkIcon(url: string): LucideIcon {
    if (url.startsWith("mailto:")) return MailIcon
    if (isPdf(url)) return FileTextIcon
    if (isExternal(url)) return ExternalLinkIcon
    return LinkIcon
}

const getLinkCategories = createServerFn().handler(async () => {
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
        return []
    }
    return result.value.filter((category) => category.liens.length > 0)
})

export const Route = createFileRoute("/_public/liens/")({
    loader: async () => ({ categories: await getLinkCategories() }),
    head: () => ({
        meta: [
            { title: pageTitle("Liens") },
            { name: "description", content: " Les liens utiles de la FARE" }
        ]
    }),
    component: Liens
})

function Liens() {
    const { categories } = Route.useLoaderData()

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
                        className="text-foreground hover:text-fare-accent transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
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
                            <h2 className="flex flex-col items-center gap-1.5 text-center text-lg font-semibold">
                                {category.name}
                                <span
                                    aria-hidden
                                    className="bg-fare-accent/40 h-1 w-8 rounded-full"
                                />
                            </h2>
                            <div className="flex flex-col gap-3">
                                {category.liens.map((link) => {
                                    const Icon = getLinkIcon(link.url)
                                    return (
                                        <Link
                                            key={link.id}
                                            href={link.url}
                                            className="group bg-card hover:border-fare-accent/30 hover:bg-fare-accent/5 relative flex items-center rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
                                            {...(isExternal(link.url) && {
                                                target: "_blank",
                                                rel: "noopener noreferrer"
                                            })}
                                        >
                                            <span className="flex w-full flex-row items-center justify-between gap-4 px-10 text-center font-medium">
                                                <span className="bg-fare-accent/10 text-fare-accent group-hover:bg-fare-accent/20 absolute left-3 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors">
                                                    <Icon className="size-4.5" />
                                                </span>
                                                <span className="flex w-full flex-col items-center justify-center">
                                                    {link.label}
                                                    {isPdf(link.url) && (
                                                        <span className="text-muted-foreground text-xs">
                                                            Document PDF
                                                        </span>
                                                    )}
                                                </span>
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
