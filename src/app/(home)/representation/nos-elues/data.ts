export type Elu = {
    firstName: string
    lastName: string
    position: string
    details?: string
}

export function useElusCROUS(): Elu[] {
    return [
        {
            firstName: "Laure",
            lastName: "CHABOT",
            position: "Titulaire",
            details: "Étudiante en LLCER Chinois"
        },
        {
            firstName: "Aurélien",
            lastName: "AYME",
            position: "Titulaire",
            details: "Étudiant en Géomatique"
        },
        {
            firstName: "Danaé",
            lastName: "LE MATELOT",
            position: "Titulaire",
            details: "Étudiante en Pharmacie"
        },
        {
            firstName: "Timéo",
            lastName: "GALLACIER",
            position: "Suppléant",
            details: "Étudiant en Droit et Sciences Politiques"
        },
        {
            firstName: "Sterenn",
            lastName: "LESAUX-COUGARD",
            position: "Suppléante",
            details: "Étudiante en Maïeutique"
        },
        {
            firstName: "Pol",
            lastName: "BLANCHARD",
            position: "Suppléant",
            details: "Étudiant en AES"
        }
    ]
}

export function useElusUnivRennes(): {
    VPE: Elu[]
    CA: Elu[]
    CFVE: Elu[]
    UFR: Elu[]
} {
    return {
        VPE: [
            {
                firstName: "Leny",
                lastName: "RABU",
                position: "VPE – Conseil d'Administration (CA)",
                details: "Étudiant en Administration de la Santé (EHESP)"
            },
            {
                firstName: "Elsa",
                lastName: "SOLARZ",
                position: "VPE – Commission Formation et Vie Étudiante (CFVE)",
                details: "Étudiante en Sciences"
            }
        ],
        CA: [
            {
                firstName: "Ilona",
                lastName: "DENIS",
                position: "Titulaire",
                details: "Étudiante en Santé Publique (EHESP)"
            },
            {
                firstName: "Carla",
                lastName: "RICHARD",
                position: "Titulaire",
                details: "Étudiante en Dentaire"
            },
            {
                firstName: "Ambre",
                lastName: "MARGELY",
                position: "Suppléante",
                details: "Étudiante en Pharmacie"
            },
            {
                firstName: "Niels",
                lastName: "MONTEIRO PEIXOTO",
                position: "Suppléant",
                details: "Étudiant en Médecine"
            },
            {
                firstName: "Adèle",
                lastName: "LESUEUR",
                position: "Suppléante",
                details: "Étudiante en Pharmacie"
            }
        ],
        CFVE: [
            {
                firstName: "Florian",
                lastName: "TESSIER",
                position: "Titulaire",
                details: "Étudiant en Sciences"
            },
            {
                firstName: "Axelle",
                lastName: "BREBANT",
                position: "Titulaire",
                details: "Étudiante en Éco-Gestion"
            },
            {
                firstName: "Paul",
                lastName: "ROBERT",
                position: "Titulaire",
                details: "Étudiant en Pharmacie"
            },
            {
                firstName: "Camille",
                lastName: "BLOT",
                position: "Titulaire",
                details: "Étudiante en Maïeutique"
            },
            {
                firstName: "Yves",
                lastName: "ALLAIN",
                position: "Titulaire",
                details: "Étudiant en Odontologie"
            },
            {
                firstName: "Jeanne",
                lastName: "CORMIER",
                position: "Titulaire",
                details: "Étudiante en Pharmacie"
            },
            {
                firstName: "Agathe",
                lastName: "BROUDER",
                position: "Titulaire",
                details: "Étudiante en BUT Carrières Juridiques"
            },
            {
                firstName: "Raphaël",
                lastName: "ABONCKELET",
                position: "Titulaire",
                details: "Étudiant en Droit"
            },
            {
                firstName: "Étienne",
                lastName: "PINEL",
                position: "Suppléant",
                details: "Étudiant en Sciences"
            },
            {
                firstName: "Hugo",
                lastName: "MAHE",
                position: "Suppléant",
                details: "Étudiant en Droit"
            },
            {
                firstName: "Océane",
                lastName: "TOURNEUR",
                position: "Suppléante",
                details: "Étudiante en Droit (Saint-Brieuc)"
            },
            {
                firstName: "Tanguy",
                lastName: "MAIRE-AMIOT",
                position: "Suppléant",
                details: "Étudiant en Ingénerie (ESIR)"
            },
            {
                firstName: "Astrid",
                lastName: "MATHIOTTE",
                position: "Suppléante",
                details: "Étudiante en Sciences"
            },
            {
                firstName: "Malo",
                lastName: "DAGORNE",
                position: "Suppléant",
                details: "Étudiant en Kinésithérapie"
            },
            {
                firstName: "Emma",
                lastName: "PINSARD",
                position: "Suppléante",
                details: "Étudiante en Médecine"
            },
            {
                firstName: "Owen",
                lastName: "GALLACIER",
                position: "Suppléant",
                details: "Étudiant en Sciences Infirmières"
            },
            {
                firstName: "Mathilde",
                lastName: "IGLESIAS",
                position: "Suppléante",
                details: "Étudiante en Santé Publique (EHESP)"
            }
        ],
        UFR: []
    }
}

export function useElusEHESP(): Elu[] {
    return [
        {
            firstName: "Clémence",
            lastName: "GAIGNEUX",
            position: "Titulaire",
            details: "Étudiante en Santé Publique"
        },
        {
            firstName: "Emma",
            lastName: "PELTAIS",
            position: "Suppléante",
            details: "Étudiante en Santé Publique"
        }
    ]
}

export function useElusRennes2(): {
    CA: Elu[]
    CFVU: Elu[]
    UFR: Elu[]
} {
    return {
        CA: [
            {
                firstName: "Robin",
                lastName: "HUET",
                position: "Titulaire",
                details: "Étudiant en AES"
            },
            {
                firstName: "Orane",
                lastName: "MÉNAGER",
                position: "Suppléante",
                details: "Étudiante en STAPS"
            }
        ],
        CFVU: [
            {
                firstName: "Eliott",
                lastName: "LESUEUR",
                position: "Titulaire",
                details: "Étudiant en Information-Communication"
            },
            {
                firstName: "Elisa",
                lastName: "BOINET",
                position: "Titulaire",
                details: "Étudiante en STAPS"
            },
            {
                firstName: "Lysia",
                lastName: "LE COENT",
                position: "Titulaire",
                details: "Étudiante en STAPS"
            },
            {
                firstName: "Alexis",
                lastName: "WALTER",
                position: "Suppléant",
                details: "Étudiant en AES"
            },
            {
                firstName: "Alexandre",
                lastName: "JOUGLA",
                position: "Suppléant"
            },
            {
                firstName: "Elouan",
                lastName: "DANIEL",
                position: "Suppléant"
            }
        ],
        UFR: [
            {
                firstName: "Manaël",
                lastName: "FORGET",
                position: "Titulaire",
                details: "Étudiant en STAPS"
            },
            {
                firstName: "Kenan",
                lastName: "BRIAND",
                position: "Titulaire",
                details: "Étudiant en STAPS"
            },
            {
                firstName: "Lysia",
                lastName: "LE COENT",
                position: "Titulaire",
                details: "Étudiante en STAPS"
            },
            {
                firstName: "Logan",
                lastName: "PEREZ",
                position: "Titulaire",
                details: "Étudiant en STAPS"
            },
            {
                firstName: "Albane",
                lastName: "ROZE",
                position: "Titulaire",
                details: "Étudiante en STAPS"
            },
            {
                firstName: "Anthony",
                lastName: "GUYOMARD",
                position: "Suppléant",
                details: "Étudiant en STAPS"
            },
            {
                firstName: "Elisa",
                lastName: "BOINET",
                position: "Suppléante",
                details: "Étudiante en STAPS"
            },
            {
                firstName: "Tom",
                lastName: "PORTENEUVE",
                position: "Suppléant",
                details: "Étudiant en STAPS"
            },
            {
                firstName: "Ana",
                lastName: "PORS",
                position: "Suppléant",
                details: "Étudiant en STAPS"
            }
        ]
    }
}
