import Image from "next/image"
import Link from "next/link"
import logo from "#public/logo_fare.png"
import HeaderLinks from "./headerLinks"
import "./header.css"
// import DefenseDroits from "./defenseDroitsButton"

export default function Header() {
    return (
        <header className="v1f">
            <Link href="/" className="v1f-logo" aria-label="Accueil">
                <Image src={logo} alt="FARE de Haute-Bretagne" priority />
            </Link>
            {/*<DefenseDroits />*/}
            <HeaderLinks />
        </header>
    )
}
