import type { Adhesion } from "@prisma/client"
import type {
    BureauMember,
    TAdhesionForm
} from "@/app/(home)/a-propos/adhesion/form-schema"
import type { UserWithPermissions } from "@/helpers/supabase/auth"

export function pdfFile(name = "doc.pdf"): File {
    return new File([new Uint8Array([1, 2, 3])], name, {
        type: "application/pdf"
    })
}

export function imageFile(name = "logo.png", type = "image/png"): File {
    return new File([new Uint8Array([1, 2, 3])], name, { type })
}

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

export function mockUser(permissions: string[] = []): UserWithPermissions {
    return {
        id: "user-1",
        name: "Test User",
        email: "test@fare-asso.fr",
        image: null,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        deletedAt: null,
        role: "ADMIN",
        permissions: permissions.map((name, i) => ({
            id: i + 1,
            userId: "user-1",
            permissionId: i + 1,
            permission: {
                id: i + 1,
                title: name,
                name,
                category: "test",
                description: null
            }
        }))
    }
}
