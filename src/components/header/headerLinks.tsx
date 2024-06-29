'use client';

import { useRef } from "react";
import HeaderLink from "./headerLink";

export default function HeaderLinks() {

    const runner = useRef<HTMLDivElement>(null);

    return(
        <nav className="border-black border-2 rounded-full py-2 flex flex-row relative items-center">
            <div ref={runner} className="bg-black z-10 rounded-full absolute h-full opacity-0 transition-all duration-300 ease-out"></div>
            
            <HeaderLink title={"Nos Assos"} href={'/reseau'} runnerRef={runner}/>
            <HeaderLink title={"Agenda"} href={'/agenda'} runnerRef={runner}/>
            <HeaderLink title={"Actualités"} href={'/actualites'} runnerRef={runner}/>
            <HeaderLink title={"A Propos"} href={'/'} runnerRef={runner}/>
            
        </nav>
    )
}