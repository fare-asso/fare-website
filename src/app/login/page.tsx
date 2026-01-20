"use client"

import { LoaderIcon } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useActionState, useTransition } from "react"
import { FcGoogle } from "react-icons/fc"
import { MdAdminPanelSettings } from "react-icons/md"
import FARELogo from "#public/logo_fare.png"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginWithGoogleAction, loginWithPasswordAction } from "./loginAction"

export default function LoginPage() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")

    const [passwordError, loginWithPassword, passwordPending] = useActionState<
        { emailError?: string; passwordError?: string } | undefined,
        FormData
    >(loginWithPasswordAction, { emailError: "", passwordError: "" })

    const [googlePending, startTransition] = useTransition()

    const handleGoogleLogin = () => {
        startTransition(() => {
            loginWithGoogleAction()
        })
    }

    return (
        <Card className="mx-auto mt-20 min-w-1/3 max-w-sm">
            <CardHeader className="flex flex-col items-start">
                <Image
                    src={FARELogo}
                    alt="Logo de la FARE"
                    className="mx-auto mb-6 w-1/5 text-center"
                />
                <CardTitle className="flex items-center gap-1">
                    <MdAdminPanelSettings size={25} />
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
                <Button
                    type="button"
                    className="h-12 w-96 max-w-full"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={googlePending}
                >
                    {googlePending ? (
                        <>
                            <LoaderIcon className="animation-duration-[1500ms] animate-spin" />
                            Redirection...
                        </>
                    ) : (
                        <>
                            <FcGoogle />
                            Continuer avec Google
                        </>
                    )}
                </Button>
                <div className="flex w-96 max-w-full items-center justify-center py-6">
                    <div className="flex-1 border-gray-300 border-t"></div>
                    <span className="px-4 text-gray-500 text-sm">ou</span>
                    <div className="flex-1 border-gray-300 border-t"></div>
                </div>
                <form action={loginWithPassword} className="space-y-3">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" name="email" id="email" />
                    {passwordError?.emailError ? (
                        <div className="font-medium text-destructive text-sm">
                            {passwordError.emailError}
                        </div>
                    ) : null}

                    <Label htmlFor="password">Password</Label>
                    <Input type="password" name="password" id="password" />
                    {passwordError?.passwordError ? (
                        <div className="font-medium text-destructive text-sm">
                            {passwordError.passwordError}
                        </div>
                    ) : null}
                    <Button disabled={passwordPending} type="submit">
                        {passwordPending ? (
                            <>
                                <LoaderIcon className="animation-duration-1500ms] animate-spin" />
                                Connexion en cours
                            </>
                        ) : (
                            "Connexion"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
