import { Image as UnpicImage } from "@unpic/react"
import type { ComponentProps } from "react"

// Compat wrapper mirroring the next/image API. With Vite, static asset
// imports resolve to URL strings, so `src` is always a string.
type ImageProps = Omit<
    ComponentProps<"img">,
    "src" | "width" | "height" | "placeholder"
> & {
    src: string
    alt: string
    width?: number | `${number}`
    height?: number | `${number}`
    fill?: boolean
    priority?: boolean
    placeholder?: string
    quality?: number
}

export default function Image({
    src,
    alt,
    width,
    height,
    fill,
    priority,
    placeholder: _placeholder,
    quality: _quality,
    ...props
}: ImageProps) {
    const priorityProps = priority
        ? ({ loading: "eager", fetchPriority: "high" } as const)
        : {}
    if (fill || width === undefined || height === undefined) {
        return (
            <UnpicImage
                {...props}
                {...priorityProps}
                src={src}
                alt={alt}
                layout="fullWidth"
            />
        )
    }
    return (
        <UnpicImage
            {...props}
            {...priorityProps}
            src={src}
            alt={alt}
            layout="constrained"
            width={Number(width)}
            height={Number(height)}
        />
    )
}
