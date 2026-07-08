import { FaFacebook, FaInstagram, FaCompass } from "react-icons/fa6"

export default function SocialLinks() {
    return (
        <div className="flex flex-row items-center space-x-4">
            {/* Instagram */}
            <a
                href="https://www.instagram.com/fare_hautebretagne"
                title="Instagram"
            >
                <FaInstagram size={25} />
            </a>

            {/* Bluesky */}
            {/* <a
                href="https://bsky.app/profile/fahb.bsky.social"
                title="Bluesky"
            >
                <FaBluesky size={25} />
            </a> */}

            {/* Facebook - caché sur mobile */}
            <a
                href="https://www.facebook.com/fare.hautebretagne/?locale=fr_FR"
                title="Facebook"
                className="hidden md:inline-block"
            >
                <FaFacebook size={25} />
            </a>

            {/* Linkedin - caché sur mobile */}
            {/* <a
                href="https://fr.linkedin.com/company/fahb"
                title="Linkedin"
                className="hidden md:inline-block"
            >
                <FaLinkedin size={25} />
            </a> */}

            {/* TikTok */}
            {/* <a href="https://www.tiktok.com/@la_fahb" title="TikTok">
                <FaTiktok size={25} />
            </a> */}

            {/* Page des liens - caché sur mobile */}
            <a
                href="/liens"
                title="Tous nos liens"
                className="hidden md:inline-block"
            >
                <FaCompass size={25} />
            </a>
        </div>
    )
}
