const FR_OPTIONS: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris"
}

/**
 * Event dates are calendar days. Format them explicitly in the event's
 * timezone (Europe/Paris) so the displayed day never shifts with the
 * viewer's or the server's timezone.
 */
export function formatEventDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("fr-FR", FR_OPTIONS)
}

const FR_COMPACT_OPTIONS: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris"
}

/**
 * "Du vendredi 17 juillet 2026 au samedi 18 juillet 2026", or with
 * `compact`, a single line for cards: "ven. 17 – sam. 18 juillet 2026".
 */
export function formatEventDateRange(
    start: Date | string,
    end: Date | string | null,
    compact = false
): string {
    if (compact) {
        const fmt = new Intl.DateTimeFormat("fr-FR", FR_COMPACT_OPTIONS)
        if (!end) return fmt.format(new Date(start))
        return fmt.formatRange(new Date(start), new Date(end))
    }

    const startLabel = formatEventDate(start)
    const endLabel = end ? formatEventDate(end) : startLabel
    if (endLabel === startLabel) return startLabel
    return `Du ${startLabel} au ${endLabel}`
}

/**
 * The calendar picker returns local-midnight dates, which serialize to the
 * previous day for timezones east of UTC. Normalize the picked calendar day
 * to UTC midnight before sending it to the server.
 */
export function toUtcMidnight(date: Date): Date {
    return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )
}
