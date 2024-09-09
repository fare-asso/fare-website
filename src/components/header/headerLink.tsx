'use client';

import Link from "next/link";
import { MouseEvent, MouseEventHandler, RefObject } from "react";
import { usePathname } from "next/navigation";
import { Link as L } from "./headerLinks";
import clsx from "clsx";

export default function HeaderLink({title, href, subLinks, runnerRef} : {title: string, href: string, subLinks?: L[],runnerRef: RefObject<HTMLDivElement>}) {

    const pathname = usePathname();

    const hoverHandler = (e : MouseEvent<HTMLDivElement>) => {
        if(runnerRef.current) {
            const target = e.currentTarget as HTMLDivElement;
            const link = target.children[0] as HTMLAnchorElement;
            const {width, left} : {width: number, left: number} = link.getBoundingClientRect();
            runnerRef.current.style.width = width + 2 + "px";
            runnerRef.current.style.left = left - target.parentElement!.getBoundingClientRect().left - 2 + "px";
            runnerRef.current.style.opacity = '1';
        } else {
            console.log('runner is null')
        }
    }

    const unhoverHandler = (e : MouseEvent<HTMLDivElement>) => {
        if(runnerRef.current) {
            runnerRef.current.style.opacity = "0";
        } else {
            console.log('runner is null')
        }
    }

    return(
        <div className="relative z-20 m-0 [&>div]:hover:opacity-100 [&>div]:hover:scale-100  [&>a]:hover:text-white transition-all" onMouseEnter={hoverHandler} onMouseLeave={unhoverHandler}>
            <Link href={href} className={clsx("text-black px-4 py-1 flex flex-col items-center h-full transition-all decoration-2", href.endsWith(pathname) ? "underline" : "")}>{title}</Link>
            
            { subLinks ? <div className="absolute opacity-0 scale-0 w-max transition-all"><div id="dropdown-links" className="flex flex-col w-max items-center space-y-1 mt-1 border-2 border-black rounded-xl p-1 bg-black">
                { subLinks?.filter((subLink) => !subLink.hidden).map((subLink) => <Link key={subLink.href} href={subLink.href} className="text-sm text-start text-white hover:bg-white/20 w-full px-3 py-1 rounded-[0.5rem]">{subLink.title}</Link>)}
            </div></div> : null }
        </div>
    )
}