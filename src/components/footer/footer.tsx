import { MdAdminPanelSettings } from "react-icons/md"

import SocialLinks from "./socialLinks"

export default function Footer() {
    return (
        <footer className="mt-auto flex h-24 w-full flex-col justify-end bg-black p-8 text-white">
            <div className="flex w-full flex-row items-end justify-between">
                <div className="flex flex-row space-x-1 text-xs opacity-75 md:space-x-4 [&>a]:hover:underline">
                    <a href="/mentions-legales">Mentions Légales</a>
                    <span>
                        © {new Date().getFullYear()} FARE. Tous droits réservés.
                    </span>
                    <a
                        className="hidden flex-row items-center space-x-1 md:flex"
                        href="/login"
                    >
                        <MdAdminPanelSettings /> <span>Espace Admin</span>
                    </a>
                </div>
                <SocialLinks />
            </div>
        </footer>
    )
}
