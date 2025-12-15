"use client"

import { type MotionValue, motion, useSpring, useTransform } from "motion/react"
import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
    className?: string
    value: number
    mass?: number
    stiffness?: number
    damping?: number
    precision?: number
    format?: (value: number) => string
    onAnimationStart?: () => void
    onAnimationComplete?: () => void
}

export function AutoAnimatedNumber({ value, ...props }: AnimatedNumberProps) {
    const [number, setNumber] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setNumber(value)
                }
            },
            { threshold: 0.1 }
        )

        const localRef = ref.current

        if (localRef) {
            observer.observe(localRef)
        }

        return () => {
            if (localRef) {
                observer.unobserve(localRef)
            }
        }
    }, [value])

    return <AnimatedNumber ref={ref} value={number} {...props} />
}

function AnimatedNumber({
    ref,
    className,
    value,
    mass = 0.8,
    stiffness = 75,
    damping = 15,
    precision = 0,
    format = (num) => num.toLocaleString(),
    onAnimationStart,
    onAnimationComplete
}: AnimatedNumberProps & { ref: React.RefObject<HTMLSpanElement | null> }) {
    const spring = useSpring(value, { mass, stiffness, damping })
    const display: MotionValue<string> = useTransform(spring, (current) =>
        format(current ? Number.parseFloat(current.toFixed(precision)) : 0)
    )

    useEffect(() => {
        spring.set(value)
        if (onAnimationStart) onAnimationStart()
        const unsubscribe = spring.on("change", () => {
            if (spring.get() === value && onAnimationComplete)
                onAnimationComplete()
        })
        return () => unsubscribe()
    }, [spring, value, onAnimationStart, onAnimationComplete])

    return (
        <motion.span ref={ref} className={className}>
            {display}
        </motion.span>
    )
}
