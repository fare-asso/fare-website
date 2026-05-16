import { describe, expect, it } from "vitest"
import type { BureauMember } from "@/app/(home)/a-propos/adhesion/form-schema"
import { validAdhesionRecord } from "@/test/factories"
import {
    generateAdhesionPdf,
    generateAdhesionPdfFromRecord
} from "./generatePdf"

const member: BureauMember = {
    isAdmin: true,
    poste: "President",
    nom: "Dupont",
    prenom: "Jean",
    filiere: "Info",
    annee: "L3",
    telephone: "0612345678",
    email: "jean@asso.fr",
    adresse: "1 rue X"
}

const isPdf = (bytes: Uint8Array): boolean =>
    bytes.length > 0 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46

describe("generateAdhesionPdf", () => {
    it("produces a non-empty PDF document", async () => {
        const pdf = await generateAdhesionPdf({
            dateAdhesion: new Date("2026-02-01T00:00:00Z"),
            sigle: "FARE",
            nomComplet: "Federation",
            college: "A",
            objetPrincipal: "Representation",
            adresseAdministrative: "Rennes",
            siegeSocial: "",
            numeroSalle: "",
            dateAG: new Date("2026-01-15T00:00:00Z"),
            nombreEtudiantsRepresentes: 1000,
            nombreAdherents: 100,
            engagementCotisation: true,
            emailAssociation: "contact@asso.fr",
            telephonePortable: "0612345678",
            telephoneFixe: "",
            bureau: [member]
        })
        expect(isPdf(pdf)).toBe(true)
    })

    it("handles a null AG date without throwing", async () => {
        const pdf = await generateAdhesionPdf({
            dateAdhesion: new Date("2026-02-01T00:00:00Z"),
            sigle: "FARE",
            nomComplet: "Federation",
            college: "B",
            objetPrincipal: "Representation",
            adresseAdministrative: "Rennes",
            siegeSocial: "",
            numeroSalle: "",
            dateAG: null,
            nombreEtudiantsRepresentes: 1,
            nombreAdherents: 1,
            engagementCotisation: false,
            emailAssociation: "contact@asso.fr",
            telephonePortable: "",
            telephoneFixe: "",
            bureau: []
        })
        expect(isPdf(pdf)).toBe(true)
    })
})

describe("generateAdhesionPdfFromRecord", () => {
    it("maps a record and produces a PDF", async () => {
        const pdf = await generateAdhesionPdfFromRecord(validAdhesionRecord())
        expect(isPdf(pdf)).toBe(true)
    })

    it("falls back to an empty bureau for invalid bureau JSON", async () => {
        const pdf = await generateAdhesionPdfFromRecord(
            validAdhesionRecord({ bureau: "not-an-array" })
        )
        expect(isPdf(pdf)).toBe(true)
    })

    it("handles a null dateAG and null telephoneFixe", async () => {
        const pdf = await generateAdhesionPdfFromRecord(
            validAdhesionRecord({ dateAG: null, telephoneFixe: null })
        )
        expect(isPdf(pdf)).toBe(true)
    })
})
