import Link from "next/link";
import SocialLinks from "./socialLinks";
import { MdAdminPanelSettings, MdOutlineWarning } from "react-icons/md";

export default function Footer() {
    return (
        <footer className="bg-black text-white w-full h-24 mt-auto p-8 flex flex-col justify-end">
            <div className="w-full flex flex-row justify-between items-end">
                <div className="opacity-75 text-xs flex flex-row space-x-1 md:space-x-4 hover:[&>a]:underline">
                    <Link href="/mentions-legales">Mentions Légales</Link>
                    <span>© 2024 FAHB. Tous droits réservés.</span>
                    <Link
                        className="hidden md:flex flex-row items-center space-x-1"
                        href="/bug-report"
                    >
                        <MdOutlineWarning /> <span>Signaler un bug</span>
                    </Link>
                    <Link
                        className="hidden md:flex flex-row items-center space-x-1"
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
