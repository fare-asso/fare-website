import { DeltaStatic } from 'quill';

export function extractFirstWords(take: number, delta: DeltaStatic): string {
    
    // Filtrer les opérations pour ne conserver que celles sans attributs
    const textOps = delta.ops?.filter((operation) => {
        return typeof operation.insert === 'string' && !operation.attributes;
    });

    if (!textOps) {
        return '';
    }

    // Joindre le texte des opérations filtrées
    const fullText = textOps.map(op => op.insert).join(' ');

    // Extraire les premiers mots
    const words = fullText.split(/\s+/).slice(0, take).join(' ');

    return words;
}
