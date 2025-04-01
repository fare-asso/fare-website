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
import { LuPartyPopper } from "react-icons/lu"; // Bagad'Asso
import { FaHandcuffs } from "react-icons/fa6"; // Bouge Ta Prison
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

export default function SideBarApp() {
    const pathname = usePathname();

    const links = [
        {
            href: "/dashboard/events",
            title: "Evènements",
            icon: <FaRegCalendarAlt />,
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
        },
        {
            href: "/dashboard/adhesions",
            title: "Adhésions",
            icon: <FaUsers />,
        },
        {
            href: "/dashboard/bouge-ta-prison",
            title: "Bouge Ta Prison",
            icon: <FaHandcuffs />,
        },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="flex items-center justify-center py-4">
                <Image
                    src={LogoFAHB}
                    alt="Logo de la FAHB"
                    className="w-16 opacity-85"
                ></Image>
                <b>Dashboard</b>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Dashboard Administrateur
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {links.map((link) => (
                                <SidebarMenuItem key={link.href}>
                                    <SidebarMenuButton asChild>
                                        <a
                                            href={link.href}
                                            className={clsx(
                                                pathname.startsWith(
                                                    link.href,
                                                ) &&
                                                    "bg-primary text-primary-foreground hover:!bg-primary/90 hover:!text-primary-foreground",
                                            )}
                                        >
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
                <SignOutButton />
            </SidebarFooter>
        </Sidebar>
    );
}
