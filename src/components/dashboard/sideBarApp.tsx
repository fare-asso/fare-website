"use client";

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
} from "../ui/sidebar";

import SignOutButton from "./signOutButton";

// Link icons
import { LuPartyPopper, LuUser } from "react-icons/lu"; // Bagad'Asso
import { FaHandcuffs, FaUser } from "react-icons/fa6"; // Bouge Ta Prison
import { FaPeopleGroup } from "react-icons/fa6"; // Membres
import { FaRegNewspaper } from "react-icons/fa6"; // Presse
import { FaUsers } from "react-icons/fa6"; // Adhésions
import { FaPen } from "react-icons/fa"; // Articles
import { FaRegCalendarAlt } from "react-icons/fa"; // Evènements
import { LuNetwork } from "react-icons/lu"; // Associations

import Image from "next/image";
import LogoFAHB from "/public/logo.webp";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import CurrentUserClient from "./currentUserClient";
import Link from "next/link";
import { Permission } from "@prisma/client";
import path from "path";

export default function SideBarApp({
    permissions,
}: {
    permissions?: Permission[];
}) {
    const pathname = usePathname();

    const links = [
        {
            href: "/dashboard/events",
            title: "Evènements",
            icon: <FaRegCalendarAlt />,
            hidden: true,
        },
        {
            href: "/dashboard/associations",
            title: "Associations",
            icon: <LuNetwork />,
        },
        {
            href: "/dashboard/articles",
            title: "Articles",
            icon: <FaPen />,
        },
        {
            href: "/dashboard/communiques-de-presse",
            title: "Presse",
            icon: <FaRegNewspaper />,
        },
        {
            href: "/dashboard/membres",
            title: "Membres",
            icon: <FaPeopleGroup />,
        },
        {
            href: "/dashboard/bagadAsso",
            title: "Bagad'Asso",
            icon: <LuPartyPopper />,
            hidden: !permissions?.find((p) => p.name === "access:bagad-asso"),
        },
        {
            href: "/dashboard/adhesions",
            title: "Adhésions",
            icon: <FaUsers />,
            hidden: !permissions?.find((p) => p.name === "access:adhesions"),
        },
        {
            href: "/dashboard/bouge-ta-prison",
            title: "Bouge Ta Prison",
            icon: <FaHandcuffs />,
            hidden: !permissions?.find((p) => p.name === "access:btp"),
        },
        {
            href: "/dashboard/users",
            title: "Utilisateurs",
            icon: <LuUser />,
            hidden: !permissions?.find((p) => p.name === "access:users"),
        },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="flex items-center justify-center py-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image
                        src={LogoFAHB}
                        alt="Logo de la FAHB"
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
                                                link.href,
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
    );
}
