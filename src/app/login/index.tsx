import { createFileRoute } from "@tanstack/react-router"
import { ShieldUserIcon } from "lucide-react"
import { isDevelopment } from "std-env"

import Image from "@/components/image"
import {
    LoginWithGoogleButton,
    LoginWithPasswordButton
} from "@/components/login/LoginButton"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

export const Route = createFileRoute("/login/")({
    validateSearch: (search: Record<string, unknown>) => ({
        error:
            typeof search.error === "string" || search.error === true
                ? String(search.error)
                : undefined
    }),
    component: LoginPage
})

function LoginPage() {
    const { error } = Route.useSearch()

    return (
        <Card className="mx-auto max-w-full min-w-1/3">
            <CardHeader className="flex flex-col items-start">
                <Image
                    src="/logo_fare.png"
                    alt="Logo de la FARE"
                    className="mx-auto mb-6 w-1/5 text-center"
                />
                <CardTitle className="flex items-center gap-1">
                    <ShieldUserIcon size={22} />
                    <span>Connexion Admin</span>
                </CardTitle>
                <CardDescription>
                    Accès réservé au bureau de la fédération
                    {error && (
                        <div className="mt-4 rounded border border-red-500 bg-red-50 p-2 text-red-600">
                            Une erreur s'est produite lors de la connexion avec
                            Google. Merci de réessayer plus tard.
                        </div>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoginWithGoogleButton />
                <div className="mt-2 text-center text-xs text-balance text-gray-500">
                    Utilisez votre adresse Google FARE (qui termine par
                    @fare-asso.fr)
                </div>

                {isDevelopment && (
                    <>
                        <div className="flex w-full items-center justify-center py-6">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-4 text-sm text-gray-500">
                                ou
                            </span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>

                        <LoginWithPasswordButton />
                    </>
                )}
            </CardContent>
        </Card>
    )
}
