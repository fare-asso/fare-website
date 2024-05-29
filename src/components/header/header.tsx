import HeaderLinks from "./headerLinks";
import HeaderLogo from "./logo";

export default function Header() {
    return(
        <div className="w-full h-20 py-4 px-8 flex flex-row items-center justify-between">
            <HeaderLogo/>
            <HeaderLinks/>
        </div>
    )
}