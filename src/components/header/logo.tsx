import Image from "next/image";

import logo from "@public/logo_fare.png";
import Link from "next/link";

export default function HeaderLogo() {
    return (
        <div className="mb-3 flex h-30 w-auto flex-row">
            <Link href="/" className="h-full w-max">
                <Image
                    src={logo}
                    alt="FARE Logo"
                    className="h-full w-auto"
                    priority
                />
            </Link>
        </div>
    );
}
