'use client';

import Link from "next/link";
import { MouseEvent, RefObject } from "react";
import { usePathname } from "next/navigation";
import { Link as L } from "./headerLinks";

export default function HeaderLink({title, href, subLinks, runnerRef} : {title: string, href: string, subLinks?: L[],runnerRef: RefObject<HTMLDivElement>}) {

    const pathname = usePathname();

    const hoverHandler = (e : MouseEvent<HTMLAnchorElement>) => {
        if(runnerRef.current) {
            const target = e.target as HTMLAnchorElement;
            const {width, left} : {width: number, left: number} = target.getBoundingClientRect();
            runnerRef.current.style.width = width + 2 + "px";
            runnerRef.current.style.left = left - target.parentElement!.getBoundingClientRect().left - 2 + "px";
            runnerRef.current.style.opacity = '1';
        } else {
            console.log('runner is null')
        }
    }

    const unhoverHandler = (e : MouseEvent<HTMLAnchorElement>) => {
        if(runnerRef.current) {
            runnerRef.current.style.opacity = "0";
        } else {
            console.log('runner is null')
        }
    }

    return(
        <div className="relative z-20 py-1 m-0">
            <Link href={href} className="px-4" onMouseEnter={() => console.log("enter")}>{title}</Link>
            <div id="dropdown-links" className="absolute flex flex-col w-full h-32 border rounded-b-xl"></div>
        </div>
    )
}