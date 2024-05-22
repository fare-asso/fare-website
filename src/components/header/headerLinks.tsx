'use client';

import { useRef } from "react";
import HeaderLink from "./headerLink";

export default function HeaderLinks() {

    const runner = useRef<HTMLDivElement>(null);

    return(
        <nav className="border-black border-2 rounded-full py-2 flex flex-row relative items-center">
            <div ref={runner} className="bg-black z-10 rounded-full absolute h-full opacity-0 transition-all delay-75 ease-out"></div>
            
            <HeaderLink title={"NOS ASSOS"} href={'#'} runnerRef={runner}/>
            <HeaderLink title={"L'AGENDA"} href={'#2'} runnerRef={runner}/>
            <HeaderLink title={"PROJETS"} href={'#2'} runnerRef={runner}/>
            <HeaderLink title={"A PROPOS"} href={'/'} runnerRef={runner}/>
            
        </nav>
    )
}