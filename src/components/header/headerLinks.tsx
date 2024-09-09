'use client';

import { useRef, useState, useEffect } from "react";
import HeaderLink from "./headerLink";
import { MdClose, MdOutlineMenu, MdExpandLess, MdExpandMore } from "react-icons/md";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface Link {
    title: string,
    href: string,
    hidden?: boolean,
    subLinks?: Link[]
}

export default function HeaderLinks({links}: {links: Link[]}) {

    const pathname = usePathname();
    const runner = useRef<HTMLDivElement>(null);
    const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
    const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleSubMenu = (title: string) => {
        setOpenSubMenus((prevState) => ({
            ...prevState,
            [title]: !prevState[title],
        }));
    };

    function renderMobileLinks(links: Link[], pathname: string, level: number) : JSX.Element | JSX.Element[] {
        return links.map((link) => {
            const isOpen = openSubMenus[link.title];
            const hasSubLinks = link.subLinks && link.subLinks.length > 0;
            
            if(link.hidden) {
                return <></>
            }

            return (
                <div key={link.title} className={clsx('flex flex-col', level == 0 && 'mb-4')}>
                    <div className={clsx("flex items-center justify-start", level == 0 && 'w-fit')}>
                        <Link 
                            href={link.href} 
                            className={clsx(pathname.startsWith(link.href) ? 'font-bold' : 'font-normal', `text-lg flex-1`, level > 0 && '!text-base pb-1')} 
                            onClick={() => setMenuIsOpen(false)}
                            style={{marginLeft: level * 20}}
                        >
                            {link.title}
                        </Link>
                        {hasSubLinks && (
                            <button 
                                onClick={() => toggleSubMenu(link.title)}
                                className="ml-2"
                            >
                                {isOpen ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                            </button>
                        )}
                    </div>

                    {hasSubLinks && isOpen && (
                        <div className="">
                            {renderMobileLinks(link.subLinks!, pathname, level + 1)}
                        </div>
                    )}
                </div>
            )
        });
    }

    function renderDesktopLinks(links: Link[], pathname: string) : JSX.Element | JSX.Element[] {
        return links.filter((link) => !link.hidden).map((link) => 
            <HeaderLink key={link.title} title={link.title} href={link.href} subLinks={link.subLinks} runnerRef={runner}/>
        )
    }

    const handleOutsideClick = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setMenuIsOpen(false);
        }
    };

    useEffect(() => {
        if (menuIsOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [menuIsOpen]);

    return(
        <div>
            {/* Navbar pour les écrans larges */}
            <nav className="border-black border-2 rounded-full hidden lg:flex flex-row relative items-center">
                <div ref={runner} className="bg-black z-10 rounded-full absolute h-full opacity-0 transition-all duration-300 ease-out"></div>
                { renderDesktopLinks(links, pathname) }
            </nav>

            {/* Bouton Burger pour les petits écrans */}
            <button className="block lg:hidden text-black" onClick={() => setMenuIsOpen(true)}>
                <MdOutlineMenu size={25} />
            </button>

            {/* Menu mobile */}
            <div ref={menuRef} id="mobileMenu" className={clsx("w-80 fixed top-0 right-0 bg-white border-l-2 min-h-screen transition-all duration-500 flex flex-col z-[9999]", menuIsOpen ? 'translate-x-0' : 'translate-x-80')}>
                <div className="w-full flex flex-row items-center justify-end p-4">
                    <button id="closeButton" className="hover:font-bold" onClick={() => setMenuIsOpen(false)}>
                        <MdClose size={25}/>
                    </button>
                </div>
                <div className="flex flex-col items-start p-8">
                    { renderMobileLinks(links, pathname, 0) }
                </div>
            </div>
        </div>
    );
}
