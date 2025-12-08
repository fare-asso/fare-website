export function dateToString(date: Date): string {
    const options = {
        day: "2-digit" as "2-digit",
        month: "long" as "long",
        year: "numeric" as "numeric",
        hour: "2-digit" as "2-digit",
        minute: "2-digit" as "2-digit"
    }
    const formatted = date.toLocaleString("fr-FR", options)
    return formatted
}
