import * as Sentry from "@sentry/tanstackstart-react"
import {
    createRootRoute,
    HeadContent,
    Link,
    Outlet,
    Scripts
} from "@tanstack/react-router"
import { Image } from "@unpic/react"
import { useEffect } from "react"

import { pageTitle } from "@/lib/seo"

import "@/styles/globals.css"
import "@/styles/not-found.css"

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1"
            },
            { title: pageTitle() },
            {
                name: "description",
                content:
                    "Fédération des Associations du Réseau Étudiant de Haute-Bretagne"
            }
        ],
        links: [{ rel: "icon", href: "/icon.png" }]
    }),
    component: RootComponent,
    notFoundComponent: NotFoundPage,
    errorComponent: RootErrorPage
})

function RootComponent() {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body className="font-sans">
                <Outlet />
                <Scripts />
            </body>
        </html>
    )
}

function NotFoundPage() {
    return (
        <main className="flex min-h-screen flex-col items-center">
            <div className="flex w-[90%] translate-x-[5%] flex-col items-center justify-center gap-12 md:translate-x-0">
                <div className="flex w-[70%] max-w-80 flex-col items-start justify-start">
                    <h2 className="title-404 m-0 w-full">
                        Vous vous êtes perdu·e...?
                    </h2>
                    <Image
                        src="/fare_loutre_sad.jpeg"
                        width={312}
                        height={312}
                        alt="404"
                        className="sad-otter size-32"
                    />
                </div>
                <Link to="/" className="mt-24 underline">
                    Retour à l'accueil
                </Link>
            </div>
        </main>
    )
}

function RootErrorPage({ error }: { error: Error }) {
    useEffect(() => {
        Sentry.captureException(error)
    }, [error])
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-bold">Une erreur est survenue</h1>
            <Link to="/" className="underline">
                Retour à l'accueil
            </Link>
        </main>
    )
}
