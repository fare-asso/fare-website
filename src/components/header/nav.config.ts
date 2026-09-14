export interface NavLink {
    title: string
    href: string
    desc?: string
    hidden?: boolean
    subLinks?: NavLink[]
}

export const links: NavLink[] = [
    {
        title: "A Propos",
        href: "/a-propos",
        subLinks: [
            {
                title: "Qu'est ce que la FARE ?",
                href: "/a-propos",
                desc: "Nos mission, nos valeurs, notre histoire"
            },
            {
                title: "Le Bureau",
                href: "/a-propos/bureau"
            },
            {
                title: "Les Associations du réseau",
                href: "/a-propos/reseau"
            },
            {
                title: "Nos partenaires",
                href: "/a-propos/partenaires"
            },
            {
                title: "Rejoindre la FARE",
                href: "/a-propos/adhesion",
                desc: "Conditions & démarche"
            },
            {
                title: "Nous contacter",
                href: "/a-propos/contact",
                desc: "Écrire à la fédération"
            }
        ]
    },
    {
        title: "Presse",
        href: "/presse",
        subLinks: [
            {
                title: "Dossiers de presse",
                href: "/presse/dossiers-de-presse",
                desc: "Analyses & rapports"
            },
            {
                title: "Communiqués de presse",
                href: "/presse/communiques-de-presse",
                desc: "Prises de position"
            }
        ]
    },
    {
        title: "Représentation",
        href: "/representation",
        subLinks: [
            {
                title: "Nos élu·es",
                href: "/representation/nos-elues",
                desc: "Conseils & instances"
            },
            {
                title: "FAGE",
                href: "/representation/fage",
                desc: "Fédération nationale"
            }
        ]
    },
    {
        title: "Projets",
        href: "/projets",
        subLinks: [
            {
                title: "AGORATour",
                href: "/projets/agorae",
                desc: "Distibutions alimentaires sur les campus"
            },
            {
                title: "Bouge Ta Prison",
                href: "/projets/bouge-ta-prison",
                desc: "Tutorat en milieu carcéral"
            },
            {
                title: "Bagad'Asso",
                href: "/projets/bagad-asso",
                desc: "Prêt de matériel aux associations"
            }
        ]
    },
    {
        title: "Formation",
        href: "/formation",
        hidden: true,
        subLinks: [
            {
                title: "Education populaire & politique de formation",
                href: "/formation/educ-pop-et-politique-de-formation",
                hidden: true
            },
            {
                title: "Évènements",
                href: "/formation/evenements",
                hidden: true
            },
            {
                title: "Catalogue de formation",
                href: "/formation/catalogue-de-formation",
                hidden: true
            },
            {
                title: "Demande de formation",
                href: "/formation/demande-de-formation"
            }
        ]
    }
]
