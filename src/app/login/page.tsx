import { ShieldUserIcon } from "lucide-react"
import Image from "next/image"
import { isDevelopment } from "std-env"

import FARELogo from "#public/logo_fare.png"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { captureActionError } from "@/lib/sentry"

import { LoginWithGoogleButton, LoginWithPasswordButton } from "./LoginButton"

export default async function LoginPage({
    searchParams
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    if (error) {
        captureActionError(error, undefined, false)
    }

    return (
        <Card className="mx-auto max-w-full min-w-1/3">
            <CardHeader className="flex flex-col items-start">
                <Image
                    src={FARELogo}
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
