'use client';

import Link from "next/link";
import { MouseEvent, RefObject } from "react";

export default function HeaderLink({title, href , runnerRef} : {title: string, href: string, runnerRef: RefObject<HTMLDivElement>}) {

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
        <Link href={href} passHref legacyBehavior>
            <a className="z-20 rounded-full flex items-center justify-center text-black text-sm px-5 font-semibold uppercase hover:text-white transition-all duration-250" onMouseEnter={hoverHandler} onMouseLeave={unhoverHandler}>{title}</a>
        </Link>
    )
}