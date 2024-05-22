import Image from "next/image";

import FAHBLogo from '../../../public/logo.webp'
import HeaderLinks from "./headerLinks";

export default function Header() {
    return(
        <div className="w-full h-20 py-4 px-8 flex flex-row items-center justify-between">
            <Image src={FAHBLogo} alt="FAHB Logo" className="w-auto h-full" priority/>
            <HeaderLinks/>
        </div>
    )
}