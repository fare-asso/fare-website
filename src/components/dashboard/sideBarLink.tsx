'use client';

import Link from "next/link";

import { usePathname } from "next/navigation";

export default function SideBarLink({href, title} : {href: string, title: string}) {

    const path = usePathname();
    
    if(path.startsWith(href)) return(
        <Link className="font-medium opacity-100 text-center rounded-lg text-base outline outline-gray-200 outline-1 px-4 py-2" href={href}>{title}</Link>
    )
    else return(
    <Link className="font-medium opacity-50 text-center rounded-lg hover:opacity-80 transition-all duration-75 text-base hover:outline outline-gray-600/50 outline-2 hover:bg-gray-100 px-4 py-2" href={href}>{title}</Link>
    )
}