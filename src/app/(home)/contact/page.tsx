import ContactForm from "@/components/public/contact/contactForm";
import Link from "next/link";
import {
    FaArrowLeft,
    FaBluesky,
    FaFacebook,
    FaInstagram,
} from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";

export default function Contact() {
    return (
        <div className="flex flex-col items-center justify-start w-full md:px-8 lg:px-16 mb-16">
            {/* Main header */}
            <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">
                Vous souhaitez nous contacter ?
            </h1>

            {/* Links */}
            <div className="flex flex-col w-full md:w-[80%] space-y-4 mb-12">
                {/* Email */}
                <Link
                    className="group flex flex-row items-center justify-between rounded-xl bg-[#4B6CB7] w-full p-4 text-white"
                    href="mailto:contact@fahb.eu"
                >
                    <div className="flex flex-row space-x-4 items-center">
                        <MdOutlineEmail size={50} />
                        <p className="text-xl font-semibold transition-all">
                            Email
                        </p>
                    </div>
                    {/* Arrow */}
                    <div className="opacity-0 scale-75 translate-x-14 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 duration-500 transition-all">
                        <FaArrowLeft size={40} />
                    </div>
                </Link>

                {/* Instagram */}
                <Link
                    className="group flex flex-row items-center justify-between rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] w-full p-4 text-white"
                    href="https://www.instagram.com/la_fahb/"
                >
                    <div className="flex flex-row space-x-4 items-center">
                        <FaInstagram size={50} />
                        <p className="text-xl font-semibold transition-all">
                            Instagram
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="opacity-0 scale-75 translate-x-14 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 duration-500 transition-all">
                        <FaArrowLeft size={40} />
                    </div>
                </Link>

                {/* Twitter - Not used anymore */}
                {/* <Link
                    className="group flex flex-row items-center justify-between rounded-xl bg-gradient-to-r from-[#14171a] to-[#2d3236] w-full p-4 text-white"
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
                <Link
                    className="group flex flex-row items-center justify-between rounded-xl bg-gradient-to-r from-[#14171a] to-[#2d3236] w-full p-4 text-white"
                    href="https://bsky.app/profile/fahb.bsky.social"
                >
                    <div className="flex flex-row space-x-4 items-center">
                        <FaBluesky size={50} />
                        <p className="text-xl font-semibold transition-all">
                            Bluesky
                        </p>
                    </div>

                    <div className="opacity-0 scale-75 translate-x-14 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 duration-500 transition-all">
                        <FaArrowLeft size={40} />
                    </div>
                </Link>

                {/* Facebook */}
                <Link
                    className="group flex flex-row items-center justify-between rounded-xl bg-gradient-to-l from-[#00c6ff] to-[#0072ff] w-full p-4 text-white"
                    href="https://www.facebook.com/la.fahb"
                >
                    <div className="flex flex-row space-x-4 items-center">
                        <FaFacebook size={50} />
                        <p className="text-xl font-semibold transition-all">
                            Facebook
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="opacity-0 scale-75 translate-x-14 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 duration-500 transition-all">
                        <FaArrowLeft size={40} />
                    </div>
                </Link>
            </div>

            <ContactForm />
        </div>
    );
}
