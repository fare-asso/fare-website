export function parseCsv(input: string): string[][] {
    const rows: string[][] = []
    let row: string[] = []
    let field = ""
    let inQuotes = false
    let started = false

    const pushField = (): void => {
        row.push(field)
        field = ""
    }
    const pushRow = (): void => {
        pushField()
        const isBlank = row.length === 1 && row[0] === "" // On saute les lignes vides
        if (!isBlank) rows.push(row)
        row = []
        started = false
    }

    for (let i = 0; i < input.length; i++) {
        const char = input[i]
        started = true

        if (inQuotes) {
            if (char === '"') {
                if (input[i + 1] === '"') {
                    field += '"'
                    i++
                } else {
                    inQuotes = false
                }
            } else {
                field += char
            }
            continue
        }

        if (char === '"') {
            inQuotes = true
        } else if (char === ",") {
            pushField()
        } else if (char === "\n") {
            pushRow()
        } else if (char === "\r") {
            if (input[i + 1] === "\n") i++
            pushRow()
        } else {
            field += char
        }
    }

    if (started || field !== "" || row.length > 0) {
        pushRow()
    }

    return rows
}
