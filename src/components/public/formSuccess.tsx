"use client"

import { useEffect, useRef } from "react"

// Wraps a form's success card so screen readers announce it (role=status)
// and keyboard focus lands on it once the form disappears.
export default function FormSuccess({
    children
}: {
    children: React.ReactNode
}) {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        ref.current?.focus()
    }, [])
    return (
        <div
            ref={ref}
            // <output> only permits phrasing content; this wraps a whole card
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="status"
            tabIndex={-1}
            className="w-full outline-none"
        >
            {children}
        </div>
    )
}
