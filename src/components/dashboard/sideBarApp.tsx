"use client"

import type { Permission } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FaPen, FaRegCalendarAlt } from "react-icons/fa" // Articles
import {
    FaHandcuffs,
    FaPeopleGroup,
    FaRegNewspaper,
    FaUsers
} from "react-icons/fa6" // Bouge Ta Prison
// Link icons
import { LuNetwork, LuPartyPopper, LuUser } from "react-icons/lu" // Bagad'Asso
import LogoFARE from "/public/logo_fare.png"
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
    SidebarMenuItem
} from "../ui/sidebar"
import CurrentUserClient from "./currentUserClient"
import SignOutButton from "./signOutButton"

export default function SideBarApp({
    permissions
}: {
    permissions?: Permission[]
}) {
    const pathname = usePathname()

    const links = [
        {
            href: "/dashboard/events",
            title: "Evènements",
            icon: <FaRegCalendarAlt />,
            hidden: true
        },
        {
            href: "/dashboard/associations",
            title: "Associations",
            icon: <LuNetwork />
        },
        {
            href: "/dashboard/articles",
            title: "Articles",
            icon: <FaPen />
        },
        {
            href: "/dashboard/communiques-de-presse",
            title: "Presse",
            icon: <FaRegNewspaper />
        },
        {
            href: "/dashboard/membres",
            title: "Membres",
            icon: <FaPeopleGroup />
        },
        {
            href: "/dashboard/bagadAsso",
            title: "Bagad'Asso",
            icon: <LuPartyPopper />,
            hidden: !permissions?.find((p) => p.name === "access:bagad-asso")
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
            hidden: !permissions?.find((p) => p.name === "access:btp")
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
                                .map((link) => (
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
                                ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <CurrentUserClient />
                <SignOutButton />
            </SidebarFooter>
        </Sidebar>
    )
}
