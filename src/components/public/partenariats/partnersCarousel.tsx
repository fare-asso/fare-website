"use client"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { GoArrowLeft, GoArrowRight } from "react-icons/go"
// Import all partner logos
import LPI from "/public/partenaires/lapetiteimprimerie.png"
import margueriteEtCie from "/public/partenaires/marguerite_et_cie.png"

export default function PartnersCarousel() {
    // Array of partner logos
    const partners = [
        { id: 1, logo: LPI, name: "La Petite Imprimerie" },
        { id: 2, logo: margueriteEtCie, name: "Marguerite & Cie" }
        // You can add more partners here
    ]

    const carouselRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)

    const scrollLeft = () => {
        if (carouselRef.current) {
            const newIndex =
                currentIndex > 0 ? currentIndex - 1 : partners.length - 1
            setCurrentIndex(newIndex)

            carouselRef.current.scrollTo({
                left: newIndex * carouselRef.current.clientWidth,
                behavior: "smooth"
            })
        }
    }

    const scrollRight = () => {
        if (carouselRef.current) {
            const newIndex =
                currentIndex < partners.length - 1 ? currentIndex + 1 : 0
            setCurrentIndex(newIndex)

            carouselRef.current.scrollTo({
                left: newIndex * carouselRef.current.clientWidth,
                behavior: "smooth"
            })
        }
    }

    // Auto-scroll functionality
    useEffect(() => {
        const autoScroll = setInterval(() => {
            scrollRight()
        }, 5000) // Change slide every 5 seconds

        return () => clearInterval(autoScroll)
    }, [scrollRight])

    return (
        <div className="relative mx-auto w-full max-w-4xl overflow-hidden">
            {/* Navigation Arrows */}
            <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 z-20 flex w-full justify-between">
                <button
                    onClick={scrollLeft}
                    title="Bouton partenaires gauche"
                    className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black bg-white/70 shadow-md transition-all hover:bg-white/90"
                >
                    <GoArrowLeft size={20} />
                </button>

                <button
                    onClick={scrollRight}
                    title="Bouton partenaires droite"
                    className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black bg-white/70 shadow-md transition-all hover:bg-white/90"
                >
                    <GoArrowRight size={20} />
                </button>
            </div>

            {/* Gradient Overlays */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent"></div>

            {/* Partners Container */}
            <div
                ref={carouselRef}
                className="no-scrollbar flex space-x-8 overflow-x-hidden scroll-smooth"
                style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch"
                }}
            >
                {partners.map((partner) => (
                    <div
                        key={partner.id}
                        className="flex h-32 w-full shrink-0 items-center justify-center"
                        style={{ scrollSnapAlign: "start" }}
                    >
                        <div className="h-full transition-all duration-300 ease-in-out hover:grayscale-0 md:grayscale">
                            <Image
                                src={partner.logo}
                                alt={`Logo de notre partenaire ${partner.name}`}
                                className="h-full max-h-full w-auto max-w-full object-contain"
                                priority
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="mt-4 flex justify-center space-x-2">
                {partners.map((_, index) => (
                    <button
                        title={`Position carousel ${index}`}
                        key={index}
                        onClick={() => {
                            setCurrentIndex(index)
                            if (carouselRef.current) {
                                carouselRef.current.scrollTo({
                                    left:
                                        index * carouselRef.current.clientWidth,
                                    behavior: "smooth"
                                })
                            }
                        }}
                        className={`h-2 w-2 rounded-full transition-all ${
                            currentIndex === index
                                ? "bg-black"
                                : "bg-gray-300 hover:bg-gray-400"
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}
