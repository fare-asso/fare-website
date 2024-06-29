import HeaderLinks from "./headerLinks";
import HeaderLogo from "./logo";

interface NavLink {
    title: string,
    href: string,
    type: string
}

export default function Header() {
    return(
        <div className="w-full h-20 py-4 px-8 flex flex-row items-center justify-between">
            <HeaderLogo/>
            <HeaderLinks/>
        </div>
    )
}