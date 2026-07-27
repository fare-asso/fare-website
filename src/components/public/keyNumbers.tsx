import { AutoAnimatedNumber } from "../ui/animated-number"

const formatNumber = (n: number): string => n.toLocaleString("fr-FR")

function Stat({ title, value }: { value: number; title: string }) {
    return (
        <div className="flex flex-col">
            <span className="relative text-3xl font-extrabold text-white tabular-nums md:text-4xl">
                <span aria-hidden="true" className="invisible">
                    {formatNumber(value)}
                </span>
                <span aria-hidden="true" className="absolute inset-0">
                    <AutoAnimatedNumber value={value} format={formatNumber} />
                </span>
                <span className="sr-only">{formatNumber(value)}</span>
            </span>
            <span className="max-w-44 text-sm text-balance text-white/85">
                {title}
            </span>
        </div>
    )
}

export default function KeyNumbers({
    associationCount,
    eluesCount
}: {
    associationCount?: number
    eluesCount?: number
}) {
    // valeurs statiques de secours si la lecture DB a échoué
    const values = [
        {
            title: "Associations étudiantes",
            value: associationCount ?? 20
        },
        { title: "Étudiant·e·s", value: 88000 },
        {
            title: "Élu·e·s universitaires & CROUS",
            value: eluesCount ?? 57
        }
    ]
    return (
        <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
            {values.map(({ title, value }) => (
                <Stat key={title} title={title} value={value} />
            ))}
        </div>
    )
}
