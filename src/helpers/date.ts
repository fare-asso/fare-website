export function dateToString(date: Date): string {
    const options = {
        day: "2-digit" as const,
        month: "long" as const,
        year: "numeric" as const,
        hour: "2-digit" as const,
        minute: "2-digit" as const
    }
    const formatted = date.toLocaleString("fr-FR", options)
    return formatted
}
