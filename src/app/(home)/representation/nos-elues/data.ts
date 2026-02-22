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
    UFR: { title: string; elus: Elu[] }[]
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
        UFR: [
            {
                title: "UFR Odontologie",
                elus: [
                    {
                        firstName: "Swann",
                        lastName: "BOURNICHE",
                        position: "Titulaire"
                    },
                    {
                        firstName: "Carla",
                        lastName: "RICHARD",
                        position: "Titulaire"
                    },
                    {
                        firstName: "Charles",
                        lastName: "GUERIN",
                        position: "Titulaire"
                    },
                    {
                        firstName: "Maelle",
                        lastName: "VERGNON",
                        position: "Titulaire"
                    },
                    {
                        firstName: "Guillaume",
                        lastName: "DOSSEH",
                        position: "Titulaire"
                    },
                    {
                        firstName: "Liz-Marie",
                        lastName: "PRAUD",
                        position: "Suppléante"
                    },
                    {
                        firstName: "Ugo",
                        lastName: "DANJOU",
                        position: "Suppléant"
                    },
                    {
                        firstName: "Malou",
                        lastName: "JAOUEN",
                        position: "Suppléante"
                    },
                    {
                        firstName: "Matthieu",
                        lastName: "ROGER VALENCE",
                        position: "Suppléant"
                    },
                    {
                        firstName: "Emma",
                        lastName: "BAYART",
                        position: "Suppléante"
                    }
                ]
            },
            {
                title: "UFR Faculté des Sciences",
                elus: [
                    {
                        firstName: "Etienne",
                        lastName: "PINEL",
                        position: "Titulaire"
                    },
                    {
                        firstName: "Astrid",
                        lastName: "MATHIOTTE",
                        position: "Titulaire"
                    },
                    {
                        firstName: "Florian",
                        lastName: "TESSIER",
                        position: "Titulaire"
                    },
                    {
                        firstName: "Anaelle",
                        lastName: "RICHARD",
                        position: "Supplétante"
                    },
                    {
                        firstName: "Pierre",
                        lastName: "MATHIOTTE",
                        position: "Supplétant"
                    },
                    {
                        firstName: "Myria",
                        lastName: "JOAO",
                        position: "Supplétante"
                    }
                ]
            },
            {
                title: "UFR Droit & Sciences politiques",
                elus: [
                    {
                        firstName: "Raphaël",
                        lastName: "ABONCKELET",
                        position: "Titulaire"
                    },
                    {
                        firstName: "Diane",
                        lastName: "HOUSSIN",
                        position: "Titulaire"
                    },
                    {
                        firstName: "Timéo",
                        lastName: "GALLACIER",
                        position: "Supplétant"
                    },
                    {
                        firstName: "Lisa",
                        lastName: "GONCALVES",
                        position: "Supplétante"
                    }
                ]
            }
        ]
    }
}

export function useElusEHESP(): Elu[] {
    return [
        {
            firstName: "Flavie",
            lastName: "POULET",
            position: "Titulaire",
            details: "Étudiante en Santé Publique"
        },
        {
            firstName: "Grave",
            lastName: "KOBOKOLA",
            position: "Suppléante",
            details: "Étudiante en Santé Publique"
        }
    ]
}

export function useElusRennes2(): {
    CA?: Elu[]
    CFVU?: Elu[]
    UFR: Elu[]
} {
    return {
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
