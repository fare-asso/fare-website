import Link from "next/link";

export default function LinkButton({
    href,
    title,
    className,
}: {
    href: string;
    title: string;
    className?: string;
}) {
    return (
        <Link
            href={href}
            title={title}
            className={
                "rounded-full px-4 py-1 text-center font-semibold transition-all hover:scale-105 " +
                className
            }
        >
            {title}
        </Link>
    );
}
