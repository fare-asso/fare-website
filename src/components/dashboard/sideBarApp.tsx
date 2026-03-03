"use client"

import type { Permission } from "@prisma/client"
import {
    FileUserIcon,
    MessageCircleQuestionMarkIcon,
    NewspaperIcon
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

    const links: SidebarLink[] = [
        {
            href: "/dashboard/events",
            title: "Evènements",
            icon: <FaRegCalendarAlt />,
            hidden: !permissions?.find((p) => p.name === "access:events")
        },
        {
            href: "/dashboard/associations",
            title: "Associations",
            icon: <LuNetwork />
        },
        {
            href: "/dashboard/articles",
            title: "Articles",
            icon: <FaPen />,
            hidden: !permissions?.find((p) => p.name === "access:articles")
        },
        {
            href: "/dashboard/communiques-de-presse",
            title: "Presse",
            icon: <NewspaperIcon />,
            hidden: !permissions?.find((p) => p.name === "access:presse")
        },
        {
            href: "/dashboard/membres",
            title: "Membres",
            icon: <FaPeopleGroup />,
            hidden: !permissions?.find((p) => p.name === "access:members")
        },
        {
            href: "/dashboard/bagadAsso",
            title: "Bagad'Asso",
            hidden: !permissions?.find((p) => p.name === "access:bagad-asso"),
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
            href: "/dashboard/adhesions",
            title: "Adhésions",
            icon: <FaUsers />,
            hidden: !permissions?.find((p) => p.name === "access:adhesions")
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
        },
        {
            href: "/dashboard/users",
            title: "Utilisateurs",
            icon: <LuUser />,
            hidden: !permissions?.find((p) => p.name === "access:users")
        }
    ]

    return (
        <Sidebar variant="inset" collapsible="offcanvas">
            <SidebarHeader className="flex items-center justify-center py-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image
                        src={LogoFARE}
                        alt="Logo de la FARE"
                        className="w-16 opacity-85"
                        priority={true}
                        placeholder="empty"
                    ></Image>
                </Link>
                <b>Dashboard</b>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Dashboard Administrateur
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {links
                                .filter((link) => !link.hidden)
                                .map((link) =>
                                    link.children ? (
                                        <SidebarMenuItem key={link.href}>
                                            <SidebarMenuButton asChild>
                                                <a href={link.href}>
                                                    {link.icon && link.icon}
                                                    <span>{link.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                            <SidebarMenuSub>
                                                {link.children.map((child) => (
                                                    <SidebarMenuSubItem
                                                        key={child.href}
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
                                                                {child.icon &&
                                                                    child.icon}
                                                                <span>
                                                                    {
                                                                        child.title
                                                                    }
                                                                </span>
                                                            </a>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </SidebarMenuItem>
                                    ) : (
                                        <SidebarMenuItem key={link.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname.startsWith(
                                                    link.href
                                                )}
                                            >
                                                <a href={link.href}>
                                                    {link.icon && link.icon}
                                                    <span>{link.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <AccountButton name={name} email={email} image={image} />
            </SidebarFooter>
        </Sidebar>
    )
}
