import Image from "next/image"
import Link from "next/link"
import FareLoutreSad from "#public/fare_loutre_sad.jpeg"
import RootLayout from "@/app/(home)/layout"
import "./not-found.css"

export default function NotFoundPage() {
    return (
        <RootLayout>
            <div className="flex w-[90%] translate-x-[5%] flex-col items-center justify-center gap-12 md:translate-x-0">
                <div className="flex w-[70%] max-w-80 flex-col items-start justify-start">
                    <h2 className="title-404 m-0 w-full">
                        Vous vous êtes perdu...?
                    </h2>
                    <Image
                        src={FareLoutreSad}
                        width={312}
                        height={312}
                        alt="404"
                        className="sad-otter size-32"
                    />
                </div>
                <Link href="/" className="mt-24 underline">
                    Retour à l'accueil
                </Link>
            </div>
        </RootLayout>
    )
}
