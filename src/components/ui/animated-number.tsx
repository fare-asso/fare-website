"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
    className?: string
    value: number
    format?: (value: number) => string
}

const DURATION = 1200

/** Counts up from 0 once scrolled into view; snaps for reduced motion. */
export function AutoAnimatedNumber({
    className,
    value,
    format = (num) => num.toLocaleString()
}: AnimatedNumberProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const [display, setDisplay] = useState(0)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        let frame = 0
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return
                observer.disconnect()
                if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
                    setDisplay(value)
                    return
                }
                const start = performance.now()
                const tick = (now: number): void => {
                    const t = Math.min((now - start) / DURATION, 1)
                    // ease-out cubic
                    setDisplay(value * (1 - (1 - t) ** 3))
                    if (t < 1) frame = requestAnimationFrame(tick)
                }
                frame = requestAnimationFrame(tick)
            },
            { threshold: 0.1 }
        )
        observer.observe(el)
        return () => {
            observer.disconnect()
            cancelAnimationFrame(frame)
        }
    }, [value])

    return (
        <span ref={ref} className={className}>
            {format(Math.round(display))}
        </span>
    )
}
