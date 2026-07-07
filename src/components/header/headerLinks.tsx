import { useLocation } from "@tanstack/react-router"
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react"
import type { CSSProperties } from "react"

import Link from "@/components/link"

import { links } from "./nav.config"

const MOBILE_MENU_ID = "fare-mobile-menu"

export default function HeaderLinks() {
    const pathname = useLocation({ select: (l) => l.pathname })
    const visible = links.filter((l) => !l.hidden)

    return (
        <>
            {/* Desktop ------------------------------------------------- */}
            <nav className="v1f-nav" aria-label="Principale">
                {visible.map((l, i) => {
                    const active = pathname.startsWith(l.href)
                    const anchorName = active
                        ? `--n${i}, --n-active`
                        : `--n${i}`
                    const subLinks = (l.subLinks ?? []).filter((s) => !s.hidden)
                    const hasSub = subLinks.length > 0

                    return (
                        <div
                            key={l.title}
                            className="v1f-item"
                            data-i={i}
                            data-active={active ? "true" : "false"}
                            style={{ "--anchor": anchorName } as CSSProperties}
                        >
                            <Link
                                href={l.href}
                                className="v1f-link"
                                aria-current={active ? "page" : undefined}
                                aria-haspopup={hasSub ? "true" : undefined}
                            >
                                {l.title}
                                {hasSub ? (
                                    <ChevronDownIcon
                                        className="v1f-caret"
                                        size={14}
                                        aria-hidden="true"
                                    />
                                ) : null}
                            </Link>
                            {hasSub ? (
                                <div className="v1f-pop-fallback" role="menu">
                                    {subLinks.map((s) => (
                                        <Link
                                            key={s.href}
                                            href={s.href}
                                            className="v1f-suba"
                                            role="menuitem"
                                            data-active={
                                                pathname === s.href
                                                    ? "true"
                                                    : undefined
                                            }
                                        >
                                            <span className="t">{s.title}</span>
                                            {s.desc ? (
                                                <span className="d">
                                                    {s.desc}
                                                </span>
                                            ) : null}
                                        </Link>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    )
                })}
                <div className="v1f-rail" aria-hidden="true" />
                <div className="v1f-pop-shared" role="presentation">
                    {visible.map((l, i) => {
                        const subLinks = (l.subLinks ?? []).filter(
                            (s) => !s.hidden
                        )
                        if (subLinks.length === 0) return null
                        return (
                            <div
                                key={l.title}
                                className="v1f-pane"
                                data-i={i}
                                role="menu"
                                aria-label={l.title}
                            >
                                {subLinks.map((s) => (
                                    <Link
                                        key={s.href}
                                        href={s.href}
                                        className="v1f-suba"
                                        role="menuitem"
                                        data-active={
                                            pathname === s.href
                                                ? "true"
                                                : undefined
                                        }
                                    >
                                        <span className="t">{s.title}</span>
                                        {s.desc ? (
                                            <span className="d">{s.desc}</span>
                                        ) : null}
                                    </Link>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </nav>

            {/* Mobile — M1 drawer (HTML popover + <details>) ----------- */}
            <button
                className="m-burger"
                type="button"
                popoverTarget={MOBILE_MENU_ID}
                aria-label="Ouvrir le menu"
            >
                <MenuIcon aria-hidden="true" />
            </button>

            <div id={MOBILE_MENU_ID} className="m1-drawer" popover="auto">
                <div className="m1-head">
                    <button
                        className="m1-close"
                        type="button"
                        popoverTarget={MOBILE_MENU_ID}
                        popoverTargetAction="hide"
                        aria-label="Fermer le menu"
                    >
                        <XIcon aria-hidden="true" />
                    </button>
                </div>
                <nav className="m1-nav" aria-label="Mobile">
                    {visible.map((l) => {
                        const subLinks = (l.subLinks ?? []).filter(
                            (s) => !s.hidden
                        )
                        if (subLinks.length > 0) {
                            return (
                                <details
                                    key={l.title}
                                    className="m-acc"
                                    open={pathname.startsWith(l.href)}
                                >
                                    <summary>
                                        <span>{l.title}</span>
                                        <ChevronDownIcon
                                            className="chev"
                                            aria-hidden="true"
                                        />
                                    </summary>
                                    <div className="m-sub">
                                        {subLinks.map((s) => (
                                            <Link
                                                key={s.href}
                                                href={s.href}
                                                data-active={
                                                    pathname === s.href
                                                        ? "true"
                                                        : "false"
                                                }
                                            >
                                                {s.title}
                                            </Link>
                                        ))}
                                    </div>
                                </details>
                            )
                        }
                        return (
                            <Link
                                key={l.title}
                                href={l.href}
                                className="m-link"
                                data-active={
                                    pathname === l.href ? "true" : "false"
                                }
                            >
                                {l.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </>
    )
}
