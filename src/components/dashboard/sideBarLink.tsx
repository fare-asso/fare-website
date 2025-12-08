"use client"

import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { MouseEventHandler } from "react"

interface SideBarLinkProps {
    href: string
    title: string
    onClick?: MouseEventHandler<HTMLAnchorElement>
}

export default function SideBarLink({
    href,
    title,
    onClick
}: SideBarLinkProps) {
    const path = usePathname()

    const _linkClassActive =
        "w-auto lg:w-full font-semibold opacity-100 text-left lg:text-center rounded-full lg:rounded-lg text-base outline outline-gray-200 outline-1 px-3 lg:px-4 py-1 lg:py-2"
    const _linkClassInactive =
        "w-auto lg:w-full font-medium opacity-50 text-left lg:text-center rounded-full lg:rounded-lg hover:opacity-80 transition-all duration-75 text-base hover:outline outline-gray-600/50 outline-2 hover:bg-gray-100 px-3 lg:px-4 py-1 lg:py-2"

    return (
        <Link
            onClick={onClick}
            className={clsx(
                "w-auto rounded-full px-3 py-1 text-left font-medium text-base opacity-50 outline-2 outline-gray-600/50 transition-all duration-75 hover:bg-gray-100 hover:opacity-80 hover:outline lg:w-full lg:rounded-lg lg:px-4 lg:py-2 lg:text-center",
                path.startsWith(href) ?? "bg-red-500 opacity-100"
            )}
            // className={
            //     path.startsWith(href) ? linkClassActive : linkClassInactive
            // }
            href={href}
        >
            {title}
        </Link>
    )
}
