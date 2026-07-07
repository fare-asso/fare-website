import Image from "@/components/image"
import Link from "@/components/link"

import HeaderLinks from "./headerLinks"

import "./header.css"
// import DefenseDroits from "./defenseDroitsButton"

export default function Header() {
    return (
        <header className="v1f">
            <Link href="/" className="v1f-logo" aria-label="Accueil">
                <Image
                    src="/logo_fare.png"
                    alt="FARE de Haute-Bretagne"
                    priority
                />
            </Link>
            {/*<DefenseDroits />*/}
            <HeaderLinks />
        </header>
    )
}
