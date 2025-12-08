import Link from "next/link"

import {
    FaBluesky,
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaTiktok
} from "react-icons/fa6"
import { TbBrandLinktree } from "react-icons/tb"

export default function SocialLinks() {
    return (
        <div className="flex flex-row items-center space-x-4">
            {/* Instagram */}
            <Link
                href="https://www.instagram.com/fare_hautebretagne"
                title="Instagram"
            >
                <FaInstagram size={25} />
            </Link>

            {/* Bluesky */}
            {/* <Link
                href="https://bsky.app/profile/fahb.bsky.social"
                title="Bluesky"
            >
                <FaBluesky size={25} />
            </Link> */}

            {/* Facebook - caché sur mobile */}
            <Link
                href="https://www.facebook.com/fare.hautebretagne/?locale=fr_FR"
                title="Facebook"
                className="hidden md:inline-block"
            >
                <FaFacebook size={25} />
            </Link>

            {/* Linkedin - caché sur mobile */}
            {/* <Link
                href="https://fr.linkedin.com/company/fahb"
                title="Linkedin"
                className="hidden md:inline-block"
            >
                <FaLinkedin size={25} />
            </Link> */}

            {/* TikTok */}
            {/* <Link href="https://www.tiktok.com/@la_fahb" title="TikTok">
                <FaTiktok size={25} />
            </Link> */}

            {/* Linktree - caché sur mobile */}
            <Link
                href="https://linktr.ee/fare_hautebretagne"
                title="Linktree"
                className="hidden md:inline-block"
            >
                <TbBrandLinktree size={25} />
            </Link>
        </div>
    )
}
