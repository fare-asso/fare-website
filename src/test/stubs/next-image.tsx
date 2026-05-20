// Stub for `next/image` used in browser tests. Vite's CJS interop of the
// real `next/image` module produces a double-default shape, breaking
// `import Image from "next/image"` at runtime. Aliased only in the browser
// project (see vitest.config.ts).

export default function NextImageStub(props: {
    src: string
    alt: string
    width?: number | string
    height?: number | string
    className?: string
}): React.JSX.Element {
    return (
        // oxlint-disable-next-line next/no-img-element -- test stub
        <img
            src={props.src}
            alt={props.alt}
            width={props.width}
            height={props.height}
            className={props.className}
        />
    )
}

export function getImageProps(props: {
    src: string
    alt: string
}): { props: { src: string; alt: string } } {
    return { props }
}
