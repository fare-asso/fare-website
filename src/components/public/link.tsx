import Link from "@/components/link"

import { Button, type ButtonVariants } from "../ui/button"

export default function LinkButton({
    href,
    title,
    className,
    variant
}: {
    href: string
    title: string
    className?: string
    variant?: ButtonVariants["variant"]
}) {
    return (
        <Button asChild variant={variant} className={className}>
            <Link href={href} title={title}>
                {title}
            </Link>
        </Button>
    )
}
