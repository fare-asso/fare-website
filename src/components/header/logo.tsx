import Image from "next/image";

import FAHBLogo from "../../../public/logo.webp";
import Link from "next/link";

export default function HeaderLogo() {
    return (
        <div className="flex h-3/4 w-auto flex-row">
            <Link href="/" className="h-full w-max">
                <Image
                    src={FAHBLogo}
                    alt="FAHB Logo"
                    className="h-full w-auto"
                    priority
                />
            </Link>
            <div className="ml-1 flex h-full flex-col justify-center *:select-none *:text-sm *:font-bold *:uppercase *:leading-3 *:tracking-tight">
                <span>federation des</span>
                <span>associations de</span>
                <span>haute bretagne</span>
            </div>
        </div>
    );
}
