import Link from "next/link"
import {
    FaArrowLeft,
    FaBluesky,
    FaFacebook,
    FaInstagram
} from "react-icons/fa6"
import { MdOutlineEmail } from "react-icons/md"
import ContactForm from "@/components/public/contact/contactForm"

export default function Contact() {
    return (
        <div className="mb-16 flex w-full flex-col items-center justify-start md:px-8 lg:px-16">
            {/* Main header */}
            <h1 className="py-12 text-center font-bold text-4xl sm:py-24">
                Vous souhaitez nous contacter ?
            </h1>

            {/* Links */}
            <div className="mb-12 flex w-full flex-col space-y-4 md:w-[80%]">
                {/* Email */}
                <Link
                    className="group flex w-full flex-row items-center justify-between rounded-xl bg-[#4B6CB7] p-4 text-white"
                    href="mailto:contact@fare-asso.fr"
                >
                    <div className="flex flex-row items-center space-x-4">
                        <MdOutlineEmail size={50} />
                        <p className="font-semibold text-xl transition-all">
                            Email
                        </p>
                    </div>
                    {/* Arrow */}
                    <div className="translate-x-14 scale-75 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100">
                        <FaArrowLeft size={40} />
                    </div>
                </Link>

                {/* Instagram */}
                <Link
                    className="group flex w-full flex-row items-center justify-between rounded-xl bg-linear-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] p-4 text-white"
                    href="https://www.instagram.com/fare_hautebretagne"
                >
                    <div className="flex flex-row items-center space-x-4">
                        <FaInstagram size={50} />
                        <p className="font-semibold text-xl transition-all">
                            Instagram
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="translate-x-14 scale-75 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100">
                        <FaArrowLeft size={40} />
                    </div>
                </Link>

                {/* Twitter - Not used anymore */}
                {/* <Link
                    className="group flex flex-row items-center justify-between rounded-xl bg-linear-to-r from-[#14171a] to-[#2d3236] w-full p-4 text-white"
                    href="https://instagram.com/"
                >
                    <div className="flex flex-row space-x-4 items-center">
                        <FaXTwitter size={50} />
                        <p className="text-xl font-semibold transition-all">
                            Twitter
                        </p>
                    </div>

                    <div className="opacity-0 scale-75 translate-x-14 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 duration-500 transition-all">
                        <FaArrowLeft size={40} />
                    </div>
                </Link> */}

                {/* Bluesky */}
                {/* <Link
                    className="group flex w-full flex-row items-center justify-between rounded-xl bg-linear-to-r from-[#14171a] to-[#2d3236] p-4 text-white"
                    href="https://bsky.app/profile/fahb.bsky.social"
                >
                    <div className="flex flex-row items-center space-x-4">
                        <FaBluesky size={50} />
                        <p className="text-xl font-semibold transition-all">
                            Bluesky
                        </p>
                    </div>

                    <div className="translate-x-14 scale-75 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100">
                        <FaArrowLeft size={40} />
                    </div>
                </Link> */}

                {/* Facebook */}
                <Link
                    className="group flex w-full flex-row items-center justify-between rounded-xl bg-linear-to-l from-[#00c6ff] to-[#0072ff] p-4 text-white"
                    href="https://www.facebook.com/fare.hautebretagne"
                >
                    <div className="flex flex-row items-center space-x-4">
                        <FaFacebook size={50} />
                        <p className="font-semibold text-xl transition-all">
                            Facebook
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="translate-x-14 scale-75 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100">
                        <FaArrowLeft size={40} />
                    </div>
                </Link>
            </div>

            <ContactForm />
        </div>
    )
}
