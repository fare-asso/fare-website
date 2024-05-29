
import Image from "next/image";

import FAHBLogo from '../../../public/logo.webp'

export default function HeaderLogo() {
    return(
        <div className="h-3/4 w-auto flex flex-row">
            <Image src={FAHBLogo} alt="FAHB Logo" className="w-auto" priority/>
            <div className="*:uppercase *:text-sm *:font-bold *:tracking-tight *:leading-3 *:select-none flex flex-col h-full  justify-center ml-1">
                <span>federation des</span>
                <span>associations de</span>
                <span>haute bretagne</span>
            </div>
        </div>
        
    )

}