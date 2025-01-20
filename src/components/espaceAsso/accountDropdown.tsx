"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import SignOutButton from "../dashboard/signOutButton";

export default function AssociationAccountDropdown({
    associationName,
    logoUrl,
}: {
    associationName: string;
    logoUrl: string;
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="relative flex flex-row items-center space-x-2 mr-2">
            <span>{associationName}</span>
            <div
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
            >
                <Image
                    src={logoUrl}
                    onClick={toggleDropdown}
                    width={35}
                    height={35}
                    alt={`Logo de ${associationName}`}
                    className="rounded-lg object-contain aspect-square w-8 h-8 hover:ring-2 ring-white transition-all cursor-pointer"
                />

                <div
                    ref={dropdownRef}
                    className={`absolute flex flex-col w-max mt-2 top-full -right-3 items-center space-y-1 border-2 border-black rounded-xl p-1 bg-black transition-all ${
                        isDropdownOpen
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-0"
                    }`}
                >
                    <SignOutButton />
                </div>
            </div>
        </div>
    );
}
