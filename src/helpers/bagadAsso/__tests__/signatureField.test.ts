import {
    AnnotationFlags,
    PDFArray,
    PDFDocument,
    PDFName,
    PDFRef,
    PDFStream
} from "pdf-lib"
import { describe, expect, it } from "vitest"

import { addBorrowerSignatureField } from "../signatureField"

describe("addBorrowerSignatureField", () => {
    it("preserves the unsigned signature field and visible widget after saving and reloading", async () => {
        const doc = await PDFDocument.create()
        const page = doc.addPage()
        const rect = { x: 42, y: 90, width: 180, height: 48 }

        addBorrowerSignatureField(doc, page, rect)

        const loaded = await PDFDocument.load(await doc.save())
        const signature = loaded.getForm().getSignature("signature_emprunteur")
        expect(signature.acroField.FT()).toEqual(PDFName.of("Sig"))
        expect(signature.acroField.V()).toBeUndefined()

        const widget = signature.acroField.getWidgets()[0]
        expect(widget.getRectangle()).toEqual(rect)
        expect(widget.P()).toEqual(loaded.getPage(0).ref)
        expect(widget.hasFlag(AnnotationFlags.Print)).toBe(true)
        expect(widget.dict.get(PDFName.of("Parent"))).toEqual(signature.ref)
        expect(
            loaded.context.lookup(widget.getNormalAppearance(), PDFStream)
        ).toBeInstanceOf(PDFStream)

        const kids = signature.acroField.Kids()
        const fields = loaded.catalog.getAcroForm()?.Fields()
        const annots = loaded.getPage(0).node.Annots()
        expect(kids).toBeInstanceOf(PDFArray)
        expect(fields).toBeInstanceOf(PDFArray)
        expect(annots).toBeInstanceOf(PDFArray)
        const widgetRef = kids?.get(0)
        expect(widgetRef).toBeInstanceOf(PDFRef)
        expect(fields?.get(0)).toEqual(signature.ref)
        expect(annots?.get(0)).toEqual(widgetRef)
    })

    it("keeps existing form fields and rejects a duplicate borrower signature", async () => {
        const doc = await PDFDocument.create()
        const page = doc.addPage()
        doc.getForm().createTextField("reference")
        const rect = { x: 10, y: 20, width: 120, height: 40 }

        addBorrowerSignatureField(doc, page, rect)
        expect(() => addBorrowerSignatureField(doc, page, rect)).toThrow(
            "PDF field already exists: signature_emprunteur"
        )

        const loaded = await PDFDocument.load(await doc.save())
        expect(loaded.getForm().getTextField("reference")).toBeDefined()
        expect(
            loaded.getForm().getSignature("signature_emprunteur")
        ).toBeDefined()
        expect(loaded.catalog.getAcroForm()?.Fields()?.size()).toBe(2)
        expect(loaded.getPage(0).node.Annots()?.size()).toBe(1)
    })
})
