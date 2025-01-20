type AllowedValue =
    | string
    | number
    | boolean
    | Date
    | File
    | Blob
    | null
    | undefined;
type DataObject = Record<string, AllowedValue | AllowedValue[]>;


/**
 * Converts a data object to FormData, with options to exclude certain fields and format dates.
 *
 * @param data - The data object to convert.
 * @param options - Optional settings for the conversion.
 * @param options.excludeFields - An array of field names to exclude from the FormData.
 * @param options.dateFormat - The format to use for date values, either "iso" or "timestamp".
 * @returns The resulting FormData object.
 */
export function zodFieldValuesToFormData(
    data: DataObject,
    options: {
        excludeFields?: string[];
        dateFormat?: "iso" | "timestamp";
    } = {},
): FormData {
    const { excludeFields = [], dateFormat = "iso" } = options;
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        // Ignorer les champs exclus
        if (excludeFields.includes(key)) {
            return;
        }

        if (value === null || value === undefined) {
            return;
        }

        // Gestion des tableaux
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (item !== null && item !== undefined) {
                    formData.append(
                        `${key}[${index}]`,
                        formatValue(item, dateFormat),
                    );
                }
            });
            return;
        }

        // Gestion des valeurs simples
        formData.append(key, formatValue(value, dateFormat));
    });

    return formData;
}

/**
 * Formats the given value based on its type and the specified date format.
 *
 * @param value - The value to format. Can be a Date, File, Blob, or other allowed types.
 * @param dateFormat - The format to use if the value is a Date. Can be "iso" or "timestamp".
 * @returns The formatted value as a string, File, or Blob.
 */
function formatValue(
    value: AllowedValue,
    dateFormat: "iso" | "timestamp",
): string | File | Blob {
    if (value instanceof Date) {
        return dateFormat === "iso"
            ? value.toISOString()
            : value.getTime().toString();
    }

    if (value instanceof File || value instanceof Blob) {
        return value;
    }

    return String(value);
}

/**
 * Converts a FormData object to a string representation.
 *
 * @param formData - The FormData object to be converted to a string.
 * @returns A string representation of the FormData object, with each entry
 * formatted as `key: value`. For files and blobs, additional details such as
 * name, type, and size are included.
 */
export function formDataToString(formData: FormData): string {
    const entries = Array.from(formData.entries());
    const formattedEntries = entries.map(([key, value]: [string, any]) => {
        // Gestion des fichiers
        if (value instanceof File) {
            return `${key}: File(name: ${value.name}, type: ${value.type}, size: ${value.size} bytes)`;
        }
        // Gestion des Blobs
        if (value instanceof Blob) {
            return `${key}: Blob(type: ${value.type}, size: ${value.size} bytes)`;
        }
        // Gestion des valeurs normales
        return `${key}: ${value}`;
    });

    return formattedEntries.join("\n");
}
