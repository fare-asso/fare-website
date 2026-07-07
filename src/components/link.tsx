import {
    Link as RouterLink,
    type LinkComponentProps
} from "@tanstack/react-router"
import type { ReactNode } from "react"

// Compat wrapper mirroring the next/link API (`href` as a plain string) so
// existing components keep their call sites; new route files use the typed
// router Link directly.
type LinkProps = Omit<LinkComponentProps, "to" | "href"> & {
    href: string
    children?: ReactNode
}

export default function Link({ href, ...props }: LinkProps) {
    return <RouterLink {...props} to={href as LinkComponentProps["to"]} />
}
