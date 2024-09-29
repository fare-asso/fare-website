import Link from "next/link";

import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { TbBrandLinktree } from "react-icons/tb";

export default function SocialLinks() {
    return(
        <div className="flex flex-row items-center space-x-4">
            {/* Instagram */}
            <Link href="https://www.instagram.com/la_fahb/" title="Instagram">
                <FaInstagram size={25}/>
            </Link>

            {/* Twitter */}
            <Link href="https://x.com/la_fahb" title="X">
                <FaXTwitter size={25}/>
            </Link>

            {/* Facebook - caché sur mobile */}
            <Link href="https://www.facebook.com/la.fahb/?locale=fr_FR" title="Facebook" className="hidden md:inline-block">
                <FaFacebook size={25}/>
            </Link>

            {/* Linkedin - caché sur mobile */}
            <Link href="https://fr.linkedin.com/company/fahb" title="Linkedin" className="hidden md:inline-block">
                <FaLinkedin size={25} />
            </Link>

            {/* TikTok */}
            <Link href="https://www.tiktok.com/@la_fahb" title="TikTok">
                <FaTiktok size={25} />
            </Link>

            {/* Linktree - caché sur mobile */}
            <Link href="https://linktr.ee/fahb" title="Linktree" className="hidden md:inline-block">
                <TbBrandLinktree size={25} />
            </Link>


        </div>
    )
}