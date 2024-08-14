'use client';

import Image from "next/image";
import { useRef, useState } from "react";
import SignOutButton from "../dashboard/signOutButton";

export default function AssociationAccountDropdown({associationName, logoUrl} : {associationName: string, logoUrl: string}) {

    const [dropdownOpacity, setDropdownOpacity] = useState<number>(0);

    let dropdownRef = useRef<HTMLDivElement>(null);

    const openDropDown = (event : React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        event.preventDefault();

        console.log('opening dropdown')
        if(dropdownRef.current) {
            dropdownRef.current.style.opacity = '1 !important'; 
            dropdownRef.current.style.scale = '100 !important';
        }
    }

    return (
    <div className="relative flex flex-row items-center space-x-2 mr-2">
        <span>{associationName}</span>
        <div className="[&>div]:hover:opacity-100 [&>div]:hover:scale-100">
            <Image src={logoUrl} onClick={openDropDown} width={35} height={35} alt={`Logo de ${associationName}`} className="rounded-lg object-contain aspect-square w-8 h-8 hover:ring-2 ring-white transition-all"
              />

            <div id="dropdown-links" ref={dropdownRef} className="absolute flex flex-col w-max mt-[60%] top-0 -right-3 items-center space-y-1 border-2 opacity-0 scale-0 border-black rounded-xl p-1 bg-black transition-all">
                    <SignOutButton />
            </div>
        </div>
        
        
    </div>
    )
}