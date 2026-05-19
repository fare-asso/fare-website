"use client"

import {
    FileUserIcon,
    MessageCircleQuestionMarkIcon,
    NewspaperIcon,
    ShieldIcon
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { FaPen, FaRegCalendarAlt } from "react-icons/fa" // Articles
import { FaHandcuffs, FaPeopleGroup, FaUsers } from "react-icons/fa6" // Bouge Ta Prison
// Link icons
import {
    LuBox,
    LuNetwork,
    LuPartyPopper,
    LuTicket,
    LuUser
} from "react-icons/lu" // Bagad'Asso

import LogoFARE from "#public/logo_fare.png"
import type { Permission } from "@/generated/prisma/client"

// UI components
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from "../ui/sidebar"
import AccountButton from "./AccountButton"

type SidebarLink = {
    href: string
    title: string
    icon?: ReactNode
    hidden?: boolean
    children?: SidebarLink[]
}

export default function SideBarApp({
    permissions,
    email,
    name,
    image
}: {
    permissions?: Permission[]
    email: string
    name?: string | null
    image?: string | null
}) {
    const pathname = usePathname()

    const menuGroups: { title?: string; links: SidebarLink[] }[] = [
        {
            title: "Contenu",
            links: [
                {
                    href: "/dashboard/associations",
                    title: "Associations",
                    icon: <LuNetwork />
                },
                {
                    href: "/dashboard/membres",
                    title: "Membres",
                    icon: <FaPeopleGroup />,
                    hidden: !permissions?.find(
                        (p) => p.name === "access:members"
                    )
                },
                {
                    href: "/dashboard/articles",
                    title: "Articles",
                    icon: <FaPen />,
                    hidden: !permissions?.find(
                        (p) => p.name === "access:articles"
                    )
                },
                {
                    href: "/dashboard/communiques-de-presse",
                    title: "Presse",
                    icon: <NewspaperIcon />,
                    hidden: !permissions?.find(
                        (p) => p.name === "access:presse"
                    )
                },
                {
                    href: "/dashboard/events",
                    title: "Evènements",
                    icon: <FaRegCalendarAlt />,
                    hidden: !permissions?.find(
                        (p) => p.name === "access:events"
                    )
                }
            ]
        },
        {
            title: "Projets",
            links: [
                {
                    href: "/dashboard/bagadAsso",
                    title: "Bagad'Asso",
                    hidden: !permissions?.find(
                        (p) => p.name === "access:bagad-asso"
                    ),
                    icon: <LuPartyPopper />,
                    children: [
                        {
                            href: "/dashboard/bagadAsso",
                            title: "Tickets",
                            icon: <LuTicket />
                        },
                        {
                            href: "/dashboard/bagadAsso/equipments",
                            title: "Matériel",
                            icon: <LuBox />
                        }
                    ]
                },
                {
                    href: "/dashboard/bouge-ta-prison",
                    title: "Bouge Ta Prison",
                    icon: <FaHandcuffs />,
                    hidden: !permissions?.find((p) => p.name === "access:btp"),
                    children: [
                        {
                            href: "/dashboard/bouge-ta-prison",
                            title: "Candidatures",
                            icon: <FileUserIcon />
                        },
                        {
                            href: "/dashboard/bouge-ta-prison/questions",
                            title: "Questions",
                            icon: <MessageCircleQuestionMarkIcon />
                        }
                    ]
                }
            ]
        },
        {
            title: "Gestion",
            links: [
                {
                    href: "/dashboard/adhesions",
                    title: "Adhésions",
                    icon: <FaUsers />,
                    hidden: !permissions?.find(
                        (p) => p.name === "access:adhesions"
                    )
                },

                {
                    href: "/dashboard/defense-des-droits",
                    title: "Défense des droits",
                    icon: <ShieldIcon />,
                    hidden: !permissions?.find(
                        (p) => p.name === "access:defense-droits"
                    )
                },
                {
                    href: "/dashboard/users",
                    title: "Utilisateurs",
                    icon: <LuUser />,
                    hidden: !permissions?.find((p) => p.name === "access:users")
                }
            ]
        }
    ]

    return (
        <Sidebar variant="inset" collapsible="offcanvas">
            <SidebarHeader className="flex flex-row items-center justify-start gap-6 py-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image
                        src={LogoFARE}
                        alt="Logo de la FARE"
                        className="w-16 opacity-85"
                        priority={true}
                        placeholder="empty"
                    ></Image>
                </Link>
                <b className="text-left">
                    Dashboard <br /> Administrateur
                </b>
            </SidebarHeader>
            <SidebarContent>
                {menuGroups.map((group) => {
                    if (group.links.some((link) => !link.hidden))
                        return (
                            <SidebarGroup key={group.title}>
                                <SidebarGroupLabel>
                                    {group.title}
                                </SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {group.links
                                            .filter((link) => !link.hidden)
                                            .map((link) =>
                                                link.children ? (
                                                    <SidebarMenuItem
                                                        key={link.href}
                                                    >
                                                        <SidebarMenuButton
                                                            asChild
                                                        >
                                                            <a href={link.href}>
                                                                {link.icon}
                                                                <span>
                                                                    {link.title}
                                                                </span>
                                                            </a>
                                                        </SidebarMenuButton>
                                                        <SidebarMenuSub>
                                                            {link.children.map(
                                                                (child) => (
                                                                    <SidebarMenuSubItem
                                                                        key={
                                                                            child.href
                                                                        }
                                                                    >
                                                                        <SidebarMenuSubButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                child.href
                                                                            }
                                                                        >
                                                                            <a
                                                                                href={
                                                                                    child.href
                                                                                }
                                                                            >
                                                                                {
                                                                                    child.icon
                                                                                }
                                                                                <span>
                                                                                    {
                                                                                        child.title
                                                                                    }
                                                                                </span>
                                                                            </a>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                )
                                                            )}
                                                        </SidebarMenuSub>
                                                    </SidebarMenuItem>
                                                ) : (
                                                    <SidebarMenuItem
                                                        key={link.href}
                                                    >
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={pathname.startsWith(
                                                                link.href
                                                            )}
                                                        >
                                                            <a href={link.href}>
                                                                {link.icon}
                                                                <span>
                                                                    {link.title}
                                                                </span>
                                                            </a>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                )
                                            )}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        )
                    return undefined
                })}
            </SidebarContent>
            <SidebarFooter>
                <AccountButton name={name} email={email} image={image} />
            </SidebarFooter>
        </Sidebar>
    )
}
