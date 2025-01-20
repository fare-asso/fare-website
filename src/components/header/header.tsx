import HeaderLinks, { Link } from "./headerLinks";
import HeaderLogo from "./logo";

const links: Link[] = [
    {
        title: "A Propos",
        href: "/a-propos",
        subLinks: [
            {
                title: "Qu'est ce que la FAHB ?",
                href: "/a-propos",
            },
            {
                title: "Le Bureau",
                href: "/bureau",
            },
            {
                title: "Les Associations du réseau",
                href: "/reseau",
            },
            {
                title: "Rejoindre la FAHB",
                href: "/adhesion",
            },
            {
                title: "Nos partenaires",
                href: "/partenaires",
                hidden: true,
            },
            {
                title: "Nous contacter",
                href: "/contact",
                hidden: false,
            },
        ],
    },
    {
        title: "Actualités",
        href: "/actualites",
    },
    {
        title: "Presse",
        href: "/presse",
        subLinks: [
            {
                title: "Dossiers de presse",
                href: "/presse/dossiers-de-presse",
            },
            {
                title: "Communiqués de presse",
                href: "/presse/communiques-de-presse",
            },
            {
                title: "Conférence de presse",
                href: "/presse/conference-de-presse",
                hidden: true,
            },
        ],
    },
    {
        title: "Représentation",
        href: "/representation",
        subLinks: [
            {
                title: "Nos élu·e·s",
                href: "/representation/nos-elues",
            },
            {
                title: "Haute-Bretagne",
                href: "/representation/haute-bretagne",
                hidden: true,
            },
            {
                title: "Jeunesse & étudiant.e.s",
                href: "/representation/jeunesse-et-etudiants",
                hidden: true,
            },
            {
                title: "FAGE",
                href: "/representation/fage",
            },
        ],
    },
    {
        title: "Projet",
        href: "/projets",
        subLinks: [
            {
                title: "AGORAé",
                href: "/agorae",
            },
            {
                title: "Bouge Ta Prison",
                href: "/bouge-ta-prison",
            },
            {
                title: "Bagad'Asso",
                href: "/bagadAsso",
            },
        ],
    },
    {
        title: "Formation",
        href: "/formation",
        hidden: true,
        subLinks: [
            {
                title: "Education populaire & politique de formation",
                href: "/formation/educ-pop-et-politique-de-formation",
                hidden: true,
            },
            {
                title: "Évènements",
                href: "/formation/evenements",
                hidden: true,
            },
            {
                title: "Catalogue de formation",
                href: "/formation/catalogue-de-formation",
                hidden: true,
            },
            {
                title: "Demande de formation",
                href: "/formation/demande-de-formation",
            },
        ],
    },
    {
        title: "Défense des droits",
        href: "defense-des-droits",
        hidden: true,
        subLinks: [
            {
                title: "Vos droits",
                href: "/defense-des-droits/vos-droits",
                hidden: true,
            },
            {
                title: "Nous contacter",
                href: "/defense-des-droits/contact",
            },
        ],
    },
    {
        title: "Agenda",
        href: "/agenda",
    },
];

export default function Header() {
    return (
        <div className="w-full h-20 py-4 px-8 flex flex-row items-center justify-between">
            <HeaderLogo />
            <HeaderLinks links={links} />
        </div>
    );
}
