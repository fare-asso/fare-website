import Image from "next/image"
import Link from "next/link"
import logo from "#public/logo_fare.png"
import HeaderLinks from "./headerLinks"

export default function Header() {
    return (
        <div className="header flex w-full flex-col-reverse items-center justify-between gap-3 px-8 py-4 lg:flex-col">
            <Link href="/" className="mb-3 flex h-30 w-auto flex-row">
                <Image
                    src={logo}
                    alt="FARE Logo"
                    className="h-full w-auto"
                    priority
                />
            </Link>
            <HeaderLinks />
        </div>
    )
}
