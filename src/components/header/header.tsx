import HeaderLinks, { Link } from "./headerLinks";
import HeaderLogo from "./logo";

const links: Link[] = [
    {
        title: "A Propos",
        href: "/about",
        subLinks: [
            {
                title: "Qu'est ce que la FAHB ?",
                href: "/about"
            },
            {
                title: "Le Bureau",
                href: "/membres"
            },
            {
                title: "Les Associations du réseau",
                href: "/reseau"
            },
            {
                title: "Nos partenaires",
                href: "/partenaires"
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
                href: "/presse/dossier-de-presse"
            },
            {
                title: "Communiqués de presse",
                href: "/presse/communiques-de-presse"
            },
            {
                title: "Conférence de presse",
                href: "/presse/conference-de-presse"
            }
        ]
    },
    {
        title: "Représentation",
        href: "/representation",
        subLinks: [
            {
                title: "Nos élu.e.s",
                href: "/representation/elus"
            },
            {
                title: "Haute-Bretagne",
                href: "/representation/haute-bretagne"
            },
            {
                title: "Jeunesse & étudiant.e.s",
                href: "/representation/jeunesse-et-etudiants"
            },
            {
                title: "FAGE",
                href: "/representation/fage"
            }
        ]
    },
    {
        title: "Projet",
        href: "/projets",
        subLinks: [
            {
                title: "AGORAé",
                href: "/agorae"
            },
            {
                title: "Bouge Ta Prison",
                href: "/bouge-ta-prison"
            },
            {
                title: "Bagad'Asso",
                href: "/bagadAsso"
            }
        ]
    },
    {
        title: "Formation",
        href: "/formation",
        subLinks: [
            {
                title: "Education populaire & politique de formation",
                href: "/formation/educ-pop-et-politique-de-formation"
            },
            {
                title: "Évènements",
                href: "/formation/evenements"
            },
            {
                title: "Catalogue de formation",
                href: "/formation/catalogue-de-formation"
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
        subLinks: [
            {
                title: "Vos droits",
                href: "/defense-des-droits/vos-droits"
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

export default function Header() {
    return(
        <div className="w-full h-20 py-4 px-8 flex flex-row items-center justify-between">
            <HeaderLogo/>
            <HeaderLinks links={links}/>
        </div>
    )
}