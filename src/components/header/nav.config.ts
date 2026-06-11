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
                title: "Notre histoire",
                href: "/a-propos/historique",
                desc: "L'origine de la FARE"
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
                title: "Rejoindre la FARE",
                href: "/a-propos/adhesion",
                desc: "Conditions & démarche"
            },
            {
                title: "Nos partenaires",
                href: "/a-propos/partenaires",
                hidden: false
            },
            {
                title: "Nous contacter",
                href: "/a-propos/contact",
                desc: "Écrire à la fédération",
                hidden: false
            }
        ]
    },
    {
        title: "Actualités",
        href: "/actualites"
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
            },
            {
                title: "Conférence de presse",
                href: "/presse/conference-de-presse",
                hidden: true
            }
        ]
    },
    {
        title: "Représentation",
        href: "/representation",
        subLinks: [
            {
                title: "Nos élu·e·s",
                href: "/representation/nos-elues",
                desc: "Conseils & instances"
            },
            {
                title: "Haute-Bretagne",
                href: "/representation/haute-bretagne",
                hidden: true
            },
            {
                title: "Jeunesse & étudiant.e.s",
                href: "/representation/jeunesse-et-etudiants",
                hidden: true
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
                title: "AGORAé",
                href: "/projets/agorae",
                desc: "Épicerie solidaire étudiante"
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
    },
    {
        title: "Défense des droits",
        href: "defense-des-droits",
        hidden: true,
        subLinks: [
            {
                title: "Vos droits",
                href: "/defense-des-droits/vos-droits",
                hidden: true
            },
            {
                title: "Nous contacter",
                href: "/defense-des-droits/contact"
            }
        ]
    },
    {
        title: "Agenda",
        href: "/agenda"
    }
]
