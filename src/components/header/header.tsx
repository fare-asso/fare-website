import HeaderLinks, { Link } from "./headerLinks";
import HeaderLogo from "./logo";

const links: Link[] = [
    {
        title: "Nos Assos",
        href: "/reseau"
    },
    {
        title: "Agenda",
        href: "/agenda"
    },
    {
        title: "Actualités",
        href: "/actualites"
    },
    {
        title: "A Propos",
        href: "/about"
    }
]

export default function Header() {
    return(
        <div className="w-full h-20 py-4 px-8 flex flex-row items-center justify-between">
            <HeaderLogo/>
            <HeaderLinks links={links}/>
        </div>
    )
}