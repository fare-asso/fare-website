"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
// Import all partner logos
import LPI from "/public/partenaires/lapetiteimprimerie.png";
import margueriteEtCie from "/public/partenaires/marguerite_et_cie.png";

export default function PartnersCarousel() {
    // Array of partner logos
    const partners = [
        { id: 1, logo: LPI, name: "La Petite Imprimerie" },
        { id: 2, logo: margueriteEtCie, name: "Marguerite & Cie" },
        // You can add more partners here
    ];

    const carouselRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const scrollLeft = () => {
        if (carouselRef.current) {
            const newIndex =
                currentIndex > 0 ? currentIndex - 1 : partners.length - 1;
            setCurrentIndex(newIndex);

            carouselRef.current.scrollTo({
                left: newIndex * carouselRef.current.clientWidth,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            const newIndex =
                currentIndex < partners.length - 1 ? currentIndex + 1 : 0;
            setCurrentIndex(newIndex);

            carouselRef.current.scrollTo({
                left: newIndex * carouselRef.current.clientWidth,
                behavior: "smooth",
            });
        }
    };

    // Auto-scroll functionality
    useEffect(() => {
        const autoScroll = setInterval(() => {
            scrollRight();
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(autoScroll);
    }, [currentIndex]);

    return (
        <div className="relative w-full max-w-4xl mx-auto overflow-hidden">
            {/* Navigation Arrows */}
            <div className="absolute z-20 top-1/2 -translate-y-1/2 w-full flex justify-between pointer-events-none">
                <button
                    onClick={scrollLeft}
                    className="rounded-full w-10 h-10 bg-white/70 border-black border flex items-center justify-center cursor-pointer pointer-events-auto shadow-md hover:bg-white/90 transition-all"
                >
                    <GoArrowLeft size={20} />
                </button>

                <button
                    onClick={scrollRight}
                    className="rounded-full w-10 h-10 bg-white/70 border-black border flex items-center justify-center cursor-pointer pointer-events-auto shadow-md hover:bg-white/90 transition-all"
                >
                    <GoArrowRight size={20} />
                </button>
            </div>

            {/* Gradient Overlays */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            {/* Partners Container */}
            <div
                ref={carouselRef}
                className="flex overflow-x-hidden scroll-smooth no-scrollbar space-x-8"
                style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {partners.map((partner) => (
                    <div
                        key={partner.id}
                        className="flex-shrink-0 w-full h-32 flex items-center justify-center"
                        style={{ scrollSnapAlign: "start" }}
                    >
                        <div className="md:grayscale hover:grayscale-0 transition-all duration-300 ease-in-out h-full">
                            <Image
                                src={partner.logo}
                                alt={`Logo de notre partenaire ${partner.name}`}
                                className="object-contain max-w-full max-h-full h-full"
                                priority
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-4 space-x-2">
                {partners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setCurrentIndex(index);
                            if (carouselRef.current) {
                                carouselRef.current.scrollTo({
                                    left:
                                        index * carouselRef.current.clientWidth,
                                    behavior: "smooth",
                                });
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
    );
}
