import Link from "next/link";
import SocialLinks from "./socialLinks";

export default function Footer() {
    return(
        <footer className="bg-black text-white w-full h-32 mt-auto p-8 flex flex-col justify-end">
            <div className="w-full flex flex-row justify-between items-end">
                <div className="opacity-75 text-xs flex flex-row space-x-1 md:space-x-4 hover:[&>a]:underline">
                    <Link href="/mentions-legales">Mentions Légales</Link>
                    <span>© 2024 FAHB. Tous droits réservés.</span>
                </div>
                <SocialLinks />
            </div>
        </footer>
    )
}