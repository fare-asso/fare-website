export type Elu = {
    firstName: string
    lastName: string
    position: string
    details?: string
}

export function useElusCROUS(): Elu[] {
    return [
        {
            firstName: "Zoée",
            lastName: "PEROCHON-DE-JAMETEL",
            position: "Titulaire",
            details: "Étudiante en Psychologie"
        },
        {
            firstName: "Gurvan",
            lastName: "MORVAN",
            position: "Titulaire",
            details: "Étudiant en Soins infirmiers"
        },
        {
            firstName: "Agathe",
            lastName: "LEMU",
            position: "Titulaire",
            details: "Étudiante en Langues"
        },
        {
            firstName: "Yoann",
            lastName: "ZARAGOSA",
            position: "Suppléant",
            details: "Étudiant en Informatique"
        },
        {
            firstName: "Ninon",
            lastName: "BRIAND",
            position: "Suppléante",
            details: "Étudiante en Pharmacie"
        },
        {
            firstName: "Robin",
            lastName: "HUET",
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
                firstName: "Mathilde",
                lastName: "GUERLESQUIN",
                position: "VPE",
                details: "Étudiante en Sciences Politiques"
            }
        ],
        CA: [
            {
                firstName: "Mathilde",
                lastName: "GUERLESQUIN",
                position: "Titulaire",
                details: "Étudiante en Sciences Politiques"
            },
            {
                firstName: "Ulysse",
                lastName: "DAVID",
                position: "titulaire",
                details: "Étudiant ingénieur"
            },
            {
                firstName: "Tristan",
                lastName: "GONTIER",
                position: "Suppléant",
                details: "Étudiant en IUT"
            },
            {
                firstName: "Maëlyss",
                lastName: "CABON",
                position: "Suppléante",
                details: "Étudiante en Informatique"
            }
        ],
        CFVE: [
            {
                firstName: "Valentin",
                lastName: "REGNAULT",
                position: "Titulaire",
                details: "Étudiant en Informatique"
            },
            {
                firstName: "Thomas",
                lastName: "HURTAUD",
                position: "Titulaire",
                details: "Étudiant en IUT"
            },
            {
                firstName: "Claudia",
                lastName: "PERREIRA",
                position: "Titulaire"
            },
            {
                firstName: "Carla",
                lastName: "RICHARD",
                position: "Titulaire",
                details: "Étudiante en Odontologie"
            },
            {
                firstName: "Morgane",
                lastName: "GRAND",
                position: "Titulaire"
            },
            {
                firstName: "Bryan",
                lastName: "GROUSSARD",
                position: "Suppléant",
                details: "Étudiant en Soins infirmiers"
            },
            {
                firstName: "Paol",
                lastName: "LE GALLOU",
                position: "Suppléant",
                details: "Étudiant ingénieur"
            }
        ],
        UFR: [
            {
                firstName: "Mattéo",
                lastName: "BECART",
                position: "Titulaire",
                details: "Étudiant en Kinésithérapie"
            },
            {
                firstName: "Gabrielle",
                lastName: "CORREIA",
                position: "Titulaire",
                details: "Étudiante en Kinésithérapie"
            },
            {
                firstName: "Laure",
                lastName: "CHABOT",
                position: "Titulaire",
                details: "Étudiante en Soins infirmiers"
            },
            {
                firstName: "Liz-Marie",
                lastName: "PRAUD",
                position: "Titulaire",
                details: "Étudiante en Odontologie"
            },
            {
                firstName: "Yves",
                lastName: "ALLAIN",
                position: "Titulaire",
                details: "Étudiant en Odontologie"
            },
            {
                firstName: "Émile",
                lastName: "CHAPPÉ",
                position: "Suppléant",
                details: "Étudiant en Odontologie"
            },
            {
                firstName: "Carla",
                lastName: "RICHARD",
                position: "Suppléante",
                details: "Étudiante en Odontologie"
            },
            {
                firstName: "Alexandre",
                lastName: "JAMES",
                position: "Suppléant",
                details: "Étudiant en Odontologie"
            },
            {
                firstName: "Adèle",
                lastName: "SERRE",
                position: "Suppléante",
                details: "Étudiante en Odontologie"
            },
            {
                firstName: "Maëlle",
                lastName: "VERGNON",
                position: "Titulaire",
                details: "Étudiante en Odontologie"
            }
        ]
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
