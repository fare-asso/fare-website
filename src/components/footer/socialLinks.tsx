import Link from "next/link";

import { FaInstagram } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";

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
        </div>
    )
}