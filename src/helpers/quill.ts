import { JsonValue } from '@prisma/client/runtime/library';
import { DeltaStatic } from 'quill';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import parse from 'html-react-parser';

export function extractFirstWords(take: number, delta: DeltaStatic): string {
    
    // Filtrer les opérations pour ne conserver que celles sans attributs
    const textOps = delta.ops?.filter((operation) => {
        return typeof operation.insert === 'string';
    });

    if (!textOps) {
        return '';
    }

    // Joindre le texte des opérations filtrées
    const fullText = textOps.map(op => {
        if(op.insert.image) {
            return '[image]'
        }

        if(op.insert.endsWith('\n')) {
            return op.insert + '[...]'
        } else {
            return op.insert
        }

    }).join(' ');

    // Extraire les premiers mots
    const words = fullText.split(/\s+/).slice(0, take).join(' ');

    return words;
}


export function convertDeltaToHTML(content: JsonValue) : string | JSX.Element | JSX.Element[] {

    const delta: DeltaStatic = JSON.parse(JSON.stringify(content));

    if(!delta.ops) {
        return ""
    }
    const converter = new QuillDeltaToHtmlConverter(delta.ops);
    return parse(converter.convert());
}