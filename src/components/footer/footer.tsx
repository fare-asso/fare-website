import Link from "next/link";
import SocialLinks from "./socialLinks";
import { MdAdminPanelSettings, MdOutlineWarning } from "react-icons/md";

export default function Footer() {
    return (
        <footer className="mt-auto flex h-24 w-full flex-col justify-end bg-black p-8 text-white">
            <div className="flex w-full flex-row items-end justify-between">
                <div className="flex flex-row space-x-1 text-xs opacity-75 md:space-x-4 [&>a]:hover:underline">
                    <Link href="/mentions-legales">Mentions Légales</Link>
                    <span>
                        © {new Date().getFullYear()} FARE. Tous droits
                        réservés.
                    </span>
                    <Link
                        className="hidden flex-row items-center space-x-1 md:flex"
                        href="/bug-report"
                    >
                        <MdOutlineWarning /> <span>Signaler un bug</span>
                    </Link>
                    <Link
                        className="hidden flex-row items-center space-x-1 md:flex"
                        href="/login"
                    >
                        <MdAdminPanelSettings /> <span>Espace Admin</span>
                    </Link>
                </div>
                <SocialLinks />
            </div>
        </footer>
    );
}
