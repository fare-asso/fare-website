import { type } from "arktype"
import { describe, expect, it } from "vitest"

import { imageFile } from "@/test/factories/files"

import { AddEquipmentSchema, EditEquipmentSchema } from "../bagadEquipment"

const base = { name: "Barnum", quantity: 2, deposit: 50 }

describe("AddEquipmentSchema", () => {
    it("accepts a valid payload without an image", () => {
        expect(AddEquipmentSchema(base) instanceof type.errors).toBe(false)
    })

    it("accepts a valid image", () => {
        const out = AddEquipmentSchema({ ...base, image: imageFile("a.png") })
        expect(out instanceof type.errors).toBe(false)
    })

    it("accepts a GIF image", () => {
        const out = AddEquipmentSchema({
            ...base,
            image: imageFile("a.gif", "image/gif")
        })
        expect(out instanceof type.errors).toBe(false)
    })

    it("rejects an SVG image (cannot be rendered by next/image)", () => {
        const out = AddEquipmentSchema({
            ...base,
            image: imageFile("a.svg", "image/svg+xml")
        })
        expect(out instanceof type.errors).toBe(true)
    })

    it("rejects an image larger than 25 Mo", () => {
        const big = imageFile("big.png")
        Object.defineProperty(big, "size", { value: 26 * 1024 * 1024 })
        const out = AddEquipmentSchema({ ...base, image: big })
        expect(out instanceof type.errors).toBe(true)
    })

    it("rejects an empty name", () => {
        expect(
            AddEquipmentSchema({ ...base, name: "" }) instanceof type.errors
        ).toBe(true)
    })

    it("rejects a negative quantity", () => {
        expect(
            AddEquipmentSchema({ ...base, quantity: -1 }) instanceof type.errors
        ).toBe(true)
    })

    it("rejects a non-integer quantity", () => {
        expect(
            AddEquipmentSchema({ ...base, quantity: 1.5 }) instanceof
                type.errors
        ).toBe(true)
    })

    it("rejects a negative deposit", () => {
        expect(
            AddEquipmentSchema({ ...base, deposit: -5 }) instanceof type.errors
        ).toBe(true)
    })

    it("rejects a non-image file", () => {
        const out = AddEquipmentSchema({
            ...base,
            image: new File([new Uint8Array([1])], "a.txt", {
                type: "text/plain"
            })
        })
        expect(out instanceof type.errors).toBe(true)
    })
})

const editBase = { ...base, id: 1, removeImage: false }

describe("EditEquipmentSchema", () => {
    it("accepts a valid payload", () => {
        expect(EditEquipmentSchema(editBase) instanceof type.errors).toBe(false)
    })

    it("rejects a missing id", () => {
        expect(EditEquipmentSchema(base) instanceof type.errors).toBe(true)
    })

    it("rejects an id below 1", () => {
        expect(
            EditEquipmentSchema({ ...editBase, id: 0 }) instanceof type.errors
        ).toBe(true)
    })

    it("requires the removeImage flag", () => {
        expect(
            EditEquipmentSchema({ ...base, id: 1 }) instanceof type.errors
        ).toBe(true)
    })
})
