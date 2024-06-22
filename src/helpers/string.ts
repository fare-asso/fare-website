
export function sanitizeString(input: string): string {
    // Normaliser la chaîne pour décomposer les caractères accentués en leurs parties de base
    const normalizedString = input.normalize("NFD");

    // Utiliser une expression régulière pour supprimer les diacritiques (accents)
    const withoutDiacritics = normalizedString.replace(/[\u0300-\u036f]/g, "");

    // Convertir en minuscules
    const lowercasedString = withoutDiacritics.toLowerCase();

    // Utiliser une expression régulière pour ne garder que les lettres minuscules, chiffres, points et traits d'union
    const sanitizedString = lowercasedString.replace(/[^a-z0-9.-]/g, '');

    return sanitizedString;
}

export function validateEmail(email: string) : boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length > 3
}

export function isUrl(string: string): boolean {
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
    return urlRegex.test(string);
}