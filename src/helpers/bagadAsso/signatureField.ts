import {
    AnnotationFlags,
    PDFHexString,
    PDFAcroSignature,
    type PDFDocument,
    type PDFPage,
    PDFWidgetAnnotation,
    popGraphicsState,
    pushGraphicsState,
    rectangle,
    setLineWidth,
    setStrokingRgbColor,
    stroke
} from "pdf-lib"

const FIELD_NAME = "signature_emprunteur"

/** Adds an unsigned, interactive signature field (not a digital signature). */
export function addBorrowerSignatureField(
    doc: PDFDocument,
    page: PDFPage,
    rect: { x: number; y: number; width: number; height: number }
): void {
    const form = doc.getForm()
    if (form.getFieldMaybe(FIELD_NAME)) {
        throw new Error(`PDF field already exists: ${FIELD_NAME}`)
    }

    const { context } = doc
    const fieldDict = context.obj({
        FT: "Sig",
        T: PDFHexString.fromText(FIELD_NAME)
    })
    const fieldRef = context.register(fieldDict)
    const field = PDFAcroSignature.fromDict(fieldDict, fieldRef)

    const widget = PDFWidgetAnnotation.create(context, fieldRef)
    widget.setRectangle(rect)
    widget.setP(page.ref)
    widget.setFlag(AnnotationFlags.Print)

    // An appearance stream makes the empty field's outline visible in viewers
    // that do not draw their own placeholder for unsigned signature widgets.
    const appearance = context.formXObject(
        [
            pushGraphicsState(),
            setLineWidth(1),
            setStrokingRgbColor(0, 0, 0),
            rectangle(0.5, 0.5, rect.width - 1, rect.height - 1),
            stroke(),
            popGraphicsState()
        ],
        { BBox: [0, 0, rect.width, rect.height], Resources: {} }
    )
    widget.setNormalAppearance(context.register(appearance))

    const widgetRef = context.register(widget.dict)
    // Without explicit Kids, pdf-lib treats the field dictionary itself as a widget.
    field.setKids([])
    field.addWidget(widgetRef)
    form.acroForm.addField(fieldRef)
    page.node.addAnnot(widgetRef)
}
