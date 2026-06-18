"use client"

import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { useRef } from "react"

import logoFahb from "#public/logo_FAHB.png"
import logoFare from "#public/logo_fare.png"
import logoFeria from "#public/logo_FERIA.jpg"

gsap.registerPlugin(ScrollTrigger)

export function HistoireFare(): React.JSX.Element {
    const container = useRef<HTMLElement>(null)

    useGSAP(
        () => {
            // Deux variantes : sur desktop les logos sont côte à côte et
            // fusionnent horizontalement et sur mobile ils sont empilés et
            // fusionnent verticalement
            const runTimeline = (axis: "x" | "y") => {
                const move = axis === "x" ? "xPercent" : "yPercent"

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: container.current,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1
                    }
                })

                // La FAHB entre
                tl.from(".fahb-block", {
                    autoAlpha: 0,
                    [move]: -40,
                    duration: 1
                })
                    // La FERIA entre côté opposé
                    .from(
                        ".feria-block",
                        { autoAlpha: 0, [move]: 40, duration: 1 },
                        ">0.4"
                    )
                    // Fusion
                    .to(
                        ".fahb-block",
                        { [move]: 60, scale: 0.65, autoAlpha: 0, duration: 1 },
                        ">0.5"
                    )
                    .to(
                        ".feria-block",
                        { [move]: -60, scale: 0.65, autoAlpha: 0, duration: 1 },
                        "<"
                    )
                    // Apparaition de la FARE au centre.
                    .fromTo(
                        ".fare-block",
                        { autoAlpha: 0, scale: 0.4 },
                        { autoAlpha: 1, scale: 1, duration: 1 },
                        "<0.25"
                    )
            }

            const mm = gsap.matchMedia()
            mm.add(
                "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
                () => runTimeline("x")
            )
            mm.add(
                "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
                () => runTimeline("y")
            )
        },
        { scope: container }
    )

    return (
        <>
            <section className="flex w-full flex-col items-center gap-6 px-4 pt-20">
                <h1 className="py-12 text-center text-[3rem] font-semibold sm:py-15">
                    Quel est le lore de la FARE ?
                </h1>
                <p className="max-w-2xl text-center">
                    Il était une fois... Lorem ipsum dolor sit amet, consectetur
                    adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis
                    nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                    commodo consequat.
                </p>
                <ChevronDown
                    aria-hidden
                    className="text-muted-foreground mt-4 size-8 animate-bounce"
                />
            </section>

            {/* Animation de fusion au scroll */}
            <section
                ref={container}
                className="relative w-full motion-safe:h-[400vh]"
            >
                <div className="relative flex flex-col items-center justify-center gap-16 py-16 motion-safe:sticky motion-safe:top-0 motion-safe:h-screen motion-safe:overflow-hidden motion-safe:py-0">
                    <div className="stage max-w-xxl relative flex w-full flex-col items-center justify-center gap-12 motion-safe:md:flex-row motion-safe:md:items-center motion-safe:md:gap-16">
                        {/* La FAHB */}
                        <article className="fahb-block flex w-full max-w-md flex-col items-center gap-4 text-center">
                            <Image
                                src={logoFahb}
                                alt="Logo de la FAHB"
                                className="h-36 w-auto max-w-full object-contain sm:h-44 md:h-52"
                            />
                            <p className="text-justify">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. In posuere est sed porta
                                placerat. Sed ultrices nisl non risus dapibus,
                                eu laoreet ligula efficitur. Mauris in euismod
                                risus, vitae rutrum ante. Suspendisse dignissim
                                nunc tristique libero semper malesuada.
                                Suspendisse vel ante euismod, congue lorem sed,
                                eleifend massa. Fusce in mi faucibus tellus
                                dictum imperdiet. Maecenas sed lacinia risus. In
                                ullamcorper sem a enim gravida sagittis. Nunc
                                tristique mauris non ligula fermentum, dapibus
                                dictum urna malesuada. Vivamus tincidunt nunc at
                                ultricies sagittis. Fusce varius commodo velit
                                quis tincidunt. Donec at laoreet mauris, eu
                                auctor nulla. Quisque quis euismod urna, sed
                                pulvinar urna. Vivamus quis.
                            </p>
                        </article>

                        {/* La FERIA */}
                        <article className="feria-block flex w-full max-w-md flex-col items-center gap-4 text-center">
                            <Image
                                src={logoFeria}
                                alt="Logo de la FERIA"
                                className="h-36 w-auto max-w-full object-contain sm:h-44 md:h-52"
                            />
                            <p className="text-justify">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. In posuere est sed porta
                                placerat. Sed ultrices nisl non risus dapibus,
                                eu laoreet ligula efficitur. Mauris in euismod
                                risus, vitae rutrum ante. Suspendisse dignissim
                                nunc tristique libero semper malesuada.
                                Suspendisse vel ante euismod, congue lorem sed,
                                eleifend massa. Fusce in mi faucibus tellus
                                dictum imperdiet. Maecenas sed lacinia risus. In
                                ullamcorper sem a enim gravida sagittis. Nunc
                                tristique mauris non ligula fermentum, dapibus
                                dictum urna malesuada. Vivamus tincidunt nunc at
                                ultricies sagittis. Fusce varius commodo velit
                                quis tincidunt. Donec at laoreet mauris, eu
                                auctor nulla. Quisque quis euismod urna, sed
                                pulvinar urna. Vivamus quis.
                            </p>
                        </article>

                        {/* La FARE */}
                        <article className="fare-block flex w-full max-w-lg flex-col items-center gap-4 text-center motion-safe:absolute motion-safe:inset-0 motion-safe:max-w-none motion-safe:justify-center">
                            <Image
                                src={logoFare}
                                alt="Logo de la FARE"
                                className="h-44 w-auto max-w-full object-contain sm:h-56 md:h-64"
                            />
                            <p className="max-w-lg text-justify">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. In posuere est sed porta
                                placerat. Sed ultrices nisl non risus dapibus,
                                eu laoreet ligula efficitur. Mauris in euismod
                                risus, vitae rutrum ante. Suspendisse dignissim
                                nunc tristique libero semper malesuada.
                                Suspendisse vel ante euismod, congue lorem sed,
                                eleifend massa. Fusce in mi faucibus tellus
                                dictum imperdiet. Maecenas sed lacinia risus. In
                                ullamcorper sem a enim gravida sagittis. Nunc
                                tristique mauris non ligula fermentum, dapibus
                                dictum urna malesuada. Vivamus tincidunt nunc at
                                ultricies sagittis. Fusce varius commodo velit
                                quis tincidunt. Donec at laoreet mauris, eu
                                auctor nulla. Quisque quis euismod urna, sed
                                pulvinar urna. Vivamus quis.
                            </p>
                        </article>
                    </div>
                </div>
            </section>
        </>
    )
}
