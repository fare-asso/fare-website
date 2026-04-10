"use client"

import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type RefObject, useCallback, useEffect, useRef, useState } from "react"
import {
    MdClose,
    MdExpandLess,
    MdExpandMore,
    MdOutlineMenu
} from "react-icons/md"
import HeaderLink from "./headerLink"

export interface NavLink {
    title: string
    href: string
    hidden?: boolean
    subLinks?: NavLink[]
}

const links: NavLink[] = [
    {
        title: "A Propos",
        href: "/a-propos",
        subLinks: [
            {
                title: "Qu'est ce que la FARE ?",
                href: "/a-propos"
            },
            {
                title: "Le Bureau",
                href: "/a-propos/bureau"
            },
            {
                title: "Les Associations du réseau",
                href: "/a-propos/reseau"
            },
            {
                title: "Rejoindre la FARE",
                href: "/a-propos/adhesion"
            },
            {
                title: "Nos partenaires",
                href: "/a-propos/partenaires",
                hidden: true
            },
            {
                title: "Nous contacter",
                href: "/a-propos/contact",
                hidden: false
            }
        ]
    },
    {
        title: "Actualités",
        href: "/actualites"
    },
    {
        title: "Presse",
        href: "/presse",
        subLinks: [
            {
                title: "Dossiers de presse",
                href: "/presse/dossiers-de-presse"
            },
            {
                title: "Communiqués de presse",
                href: "/presse/communiques-de-presse"
            },
            {
                title: "Conférence de presse",
                href: "/presse/conference-de-presse",
                hidden: true
            }
        ]
    },
    {
        title: "Représentation",
        href: "/representation",
        subLinks: [
            {
                title: "Nos élu·e·s",
                href: "/representation/nos-elues"
            },
            {
                title: "Haute-Bretagne",
                href: "/representation/haute-bretagne",
                hidden: true
            },
            {
                title: "Jeunesse & étudiant.e.s",
                href: "/representation/jeunesse-et-etudiants",
                hidden: true
            },
            {
                title: "FAGE",
                href: "/representation/fage"
            }
        ]
    },
    {
        title: "Projets",
        href: "/projets",
        subLinks: [
            {
                title: "AGORAé",
                href: "/projets/agorae"
            },
            {
                title: "Bouge Ta Prison",
                href: "/projets/bouge-ta-prison"
            },
            {
                title: "Bagad'Asso",
                href: "/projets/bagad-asso"
            }
        ]
    },
    {
        title: "Formation",
        href: "/formation",
        hidden: true,
        subLinks: [
            {
                title: "Education populaire & politique de formation",
                href: "/formation/educ-pop-et-politique-de-formation",
                hidden: true
            },
            {
                title: "Évènements",
                href: "/formation/evenements",
                hidden: true
            },
            {
                title: "Catalogue de formation",
                href: "/formation/catalogue-de-formation",
                hidden: true
            },
            {
                title: "Demande de formation",
                href: "/formation/demande-de-formation"
            }
        ]
    },
    {
        title: "Défense des droits",
        href: "defense-des-droits",
        hidden: true,
        subLinks: [
            {
                title: "Vos droits",
                href: "/defense-des-droits/vos-droits",
                hidden: true
            },
            {
                title: "Nous contacter",
                href: "/defense-des-droits/contact"
            }
        ]
    },
    {
        title: "Agenda",
        href: "/agenda"
    }
]

export default function HeaderLinks() {
    const pathname = usePathname()
    const runner = useRef<HTMLDivElement>(null)
    const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false)
    const [openSubMenus, setOpenSubMenus] = useState<{
        [key: string]: boolean
    }>({})
    const menuRef = useRef<HTMLDivElement>(null)

    const toggleSubMenu = (title: string) => {
        setOpenSubMenus((prevState) => ({
            ...prevState,
            [title]: !prevState[title]
        }))
    }

    function renderMobileLinks(
        links: NavLink[],
        pathname: string,
        level: number
    ): React.ReactElement | React.ReactElement[] {
        return links
            .filter((link) => !link.hidden)
            .map((link) => {
                const isOpen = openSubMenus[link.title]
                const hasSubLinks = link.subLinks && link.subLinks.length > 0

                return (
                    <div
                        key={link.title}
                        className={clsx("flex flex-col", level === 0 && "mb-4")}
                    >
                        <div
                            className={clsx(
                                "flex items-center justify-start",
                                level === 0 && "w-fit"
                            )}
                        >
                            <Link
                                href={link.href}
                                className={clsx(
                                    pathname.startsWith(link.href)
                                        ? "font-bold"
                                        : "font-normal",
                                    `flex-1 text-lg`,
                                    level > 0 && "pb-1 text-base!"
                                )}
                                onClick={() => setMenuIsOpen(false)}
                                style={{ marginLeft: level * 20 }}
                            >
                                {link.title}
                            </Link>
                            {hasSubLinks && (
                                <button
                                    type="button"
                                    onClick={() => toggleSubMenu(link.title)}
                                    className="ml-2"
                                >
                                    {isOpen ? (
                                        <MdExpandLess size={20} />
                                    ) : (
                                        <MdExpandMore size={20} />
                                    )}
                                </button>
                            )}
                        </div>

                        {hasSubLinks && isOpen && link.subLinks && (
                            <div key={`sublink-${link.title}`} className="">
                                {renderMobileLinks(
                                    link.subLinks,
                                    pathname,
                                    level + 1
                                )}
                            </div>
                        )}
                    </div>
                )
            })
    }

    function renderDesktopLinks(
        links: NavLink[],
        _pathname: string
    ): React.ReactElement | React.ReactElement[] {
        return links
            .filter((link) => !link.hidden)
            .map((link) => (
                <HeaderLink
                    key={link.title}
                    title={link.title}
                    href={link.href}
                    subLinks={link.subLinks}
                    runnerRef={runner as RefObject<HTMLDivElement>}
                />
            ))
    }

    const handleOutsideClick = useCallback((event: MouseEvent) => {
        if (
            menuRef.current &&
            !menuRef.current.contains(event.target as Node)
        ) {
            setMenuIsOpen(false)
        }
    }, [])

    useEffect(() => {
        if (menuIsOpen) {
            document.addEventListener("mousedown", handleOutsideClick)
        } else {
            document.removeEventListener("mousedown", handleOutsideClick)
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick)
        }
    }, [menuIsOpen, handleOutsideClick])

    return (
        <div className="w-full lg:w-auto">
            {/* Navbar pour les écrans larges */}
            <nav className="relative hidden flex-row items-center rounded-full border-2 border-black lg:flex">
                <div
                    ref={runner}
                    className="absolute z-10 h-full rounded-full bg-black opacity-0 transition-all duration-300 ease-out"
                ></div>
                {renderDesktopLinks(links, pathname)}
            </nav>

            {/* Bouton Burger pour les petits écrans */}
            <button
                type="button"
                className="ml-auto block text-black lg:ml-0 lg:hidden"
                onClick={() => setMenuIsOpen(true)}
            >
                <MdOutlineMenu size={25} />
            </button>

            {/* Menu mobile */}
            <div
                ref={menuRef}
                id="mobileMenu"
                className={clsx(
                    "fixed top-0 right-0 z-9999 flex min-h-screen w-80 flex-col border-l-2 bg-white transition-all duration-500",
                    menuIsOpen ? "translate-x-0" : "translate-x-80"
                )}
            >
                <div className="flex w-full flex-row items-center justify-end p-4">
                    <button
                        type="button"
                        id="closeButton"
                        className="hover:font-bold"
                        onClick={() => setMenuIsOpen(false)}
                    >
                        <MdClose size={25} />
                    </button>
                </div>
                <div className="flex flex-col items-start p-8">
                    {renderMobileLinks(links, pathname, 0)}
                </div>
            </div>
        </div>
    )
}
