"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MouseEventHandler } from "react";

interface SideBarLinkProps {
    href: string;
    title: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function SideBarLink({
    href,
    title,
    onClick,
}: SideBarLinkProps) {
    const path = usePathname();

    const linkClassActive =
        "w-auto lg:w-full font-semibold opacity-100 text-left lg:text-center rounded-full lg:rounded-lg text-base outline outline-gray-200 outline-1 px-3 lg:px-4 py-1 lg:py-2";
    const linkClassInactive =
        "w-auto lg:w-full font-medium opacity-50 text-left lg:text-center rounded-full lg:rounded-lg hover:opacity-80 transition-all duration-75 text-base hover:outline outline-gray-600/50 outline-2 hover:bg-gray-100 px-3 lg:px-4 py-1 lg:py-2";

    return (
        <Link
            onClick={onClick}
            className={
                path.startsWith(href) ? linkClassActive : linkClassInactive
            }
            href={href}
        >
            {title}
        </Link>
    );
}
