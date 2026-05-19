"use client"

import Image from "next/image"
import { useRef, useState } from "react"

export default function AssociationAccountDropdown({
    associationName,
    logoUrl
}: {
    associationName: string
    logoUrl: string
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    return (
        <div className="relative mr-2 flex flex-row items-center space-x-2">
            <span>{associationName}</span>
            <button
                type="button"
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
                onClick={toggleDropdown}
            >
                <Image
                    src={logoUrl}
                    width={35}
                    height={35}
                    alt={`Logo de ${associationName}`}
                    className="aspect-square h-8 w-8 cursor-pointer rounded-lg object-contain ring-white transition-all hover:ring-2"
                />

                <div
                    ref={dropdownRef}
                    className={`absolute top-full -right-3 mt-2 flex w-max flex-col items-center space-y-1 rounded-xl border-2 border-black bg-black p-1 transition-all ${
                        isDropdownOpen
                            ? "scale-100 opacity-100"
                            : "scale-0 opacity-0"
                    }`}
                ></div>
            </button>
        </div>
    )
}
