"use client";

import Link from "next/link";
import { MouseEvent, MouseEventHandler, RefObject } from "react";
import { usePathname } from "next/navigation";
import { Link as L } from "./headerLinks";
import clsx from "clsx";

export default function HeaderLink({
    title,
    href,
    subLinks,
    runnerRef,
}: {
    title: string;
    href: string;
    subLinks?: L[];
    runnerRef: RefObject<HTMLDivElement>;
}) {
    const pathname = usePathname();

    const hoverHandler = (e: MouseEvent<HTMLDivElement>) => {
        if (runnerRef.current) {
            const target = e.currentTarget as HTMLDivElement;
            const link = target.children[0] as HTMLAnchorElement;
            const { width, left }: { width: number; left: number } =
                link.getBoundingClientRect();
            runnerRef.current.style.width = width + 2 + "px";
            runnerRef.current.style.left =
                left -
                target.parentElement!.getBoundingClientRect().left -
                2 +
                "px";
            runnerRef.current.style.opacity = "1";
        } else {
            console.log("runner is null");
        }
    };

    const unhoverHandler = (e: MouseEvent<HTMLDivElement>) => {
        if (runnerRef.current) {
            runnerRef.current.style.opacity = "0";
        } else {
            console.log("runner is null");
        }
    };

    return (
        <div
            className="relative z-20 m-0 transition-all [&>a]:hover:text-white [&>div]:hover:scale-100 [&>div]:hover:opacity-100"
            onMouseEnter={hoverHandler}
            onMouseLeave={unhoverHandler}
        >
            <Link
                href={href}
                className={clsx(
                    "flex h-full flex-col items-center px-4 py-1 text-black decoration-2 transition-all",
                    href.endsWith(pathname) ? "underline" : "",
                )}
            >
                {title}
            </Link>

            {subLinks ?
                <div className="absolute w-max scale-0 opacity-0 transition-all">
                    <div
                        id="dropdown-links"
                        className="mt-1 flex w-max flex-col items-center space-y-1 rounded-xl border-2 border-black bg-black p-1"
                    >
                        {subLinks
                            ?.filter((subLink) => !subLink.hidden)
                            .map((subLink) => (
                                <Link
                                    key={subLink.href}
                                    href={subLink.href}
                                    className="w-full rounded-[0.5rem] px-3 py-1 text-start text-sm text-white hover:bg-white/20"
                                >
                                    {subLink.title}
                                </Link>
                            ))}
                    </div>
                </div>
            :   null}
        </div>
    );
}
