import type {
    BureauMember,
    TAdhesionForm
} from "@/app/(public)/a-propos/adhesion/form-schema"
import type { Adhesion } from "@/generated/prisma/client"

import { imageFile, pdfFile } from "./files"

const bureauMember: BureauMember = {
    isAdmin: true,
    poste: "President",
    nom: "Dupont",
    prenom: "Jean",
    filiere: "Info",
    annee: "L3",
    telephone: "0612345678",
    email: "jean@asso.fr",
    adresse: "1 rue de la Paix, 35000 Rennes"
}

export function validAdhesionForm(
    overrides: Partial<TAdhesionForm> = {}
): TAdhesionForm {
    return {
        sigle: "FARE",
        nomComplet: "Federation des Associations",
        logo: imageFile(),
        college: "A",
        filiere: "Informatique",
        objetPrincipal: "Representation etudiante",
        adresseAdministrative: "6 Cours des Allies, 35000 Rennes",
        siegeSocial: "",
        numeroSalle: "",
        dateAG: new Date("2026-01-15T00:00:00Z"),
        nombreEtudiantsRepresentes: 1000,
        nombreAdherents: 100,
        engagementCotisation: true,
        emailAssociation: "contact@asso.fr",
        telephonePortable: "0612345678",
        telephoneFixe: "",
        bureau: [bureauMember],
        statuts: pdfFile("statuts.pdf"),
        recepisse: pdfFile("recepisse.pdf"),
        extraitPV: pdfFile("pv.pdf"),
        captchaToken: "token-123",
        ...overrides
    }
}

export function validAdhesionRecord(
    overrides: Partial<Adhesion> = {}
): Adhesion {
    return {
        id: 1,
        createdAt: new Date("2026-02-01T00:00:00Z"),
        archived: null,
        association: "Federation des Associations",
        folderPath: "uuid-fare",
        nomComplet: "Federation des Associations",
        sigle: "FARE",
        email: "contact@asso.fr",
        telephonePortable: "0612345678",
        telephoneFixe: null,
        college: "A",
        objetPrincipal: "Representation etudiante",
        adresseAdministrative: "6 Cours des Allies, 35000 Rennes",
        dateAG: new Date("2026-01-15T00:00:00Z"),
        nombreAdherents: 100,
        nombreEtudiantsRepresentes: 1000,
        filiere: "Informatique",
        siegeSocial: "",
        numeroSalle: "",
        engagementCotisation: true,
        logoPath: "uuid-fare/logo.png",
        statutsPath: "uuid-fare/statuts.pdf",
        recepissePath: "uuid-fare/recepisse.pdf",
        extraitPVPath: "uuid-fare/extraitPV.pdf",
        lettreEngagementPath: null,
        reglementInterieurPath: null,
        bilanFinancierPath: null,
        bureau: [bureauMember],
        ...overrides
    }
}
