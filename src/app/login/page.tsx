"use client"

import { LoaderIcon, MailIcon } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Suspense, useActionState, useState, useTransition } from "react"
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
    return (
        <Suspense fallback={<LoginPageSkeleton />}>
            <LoginPageContent />
        </Suspense>
    )
}

function LoginPageSkeleton() {
    return (
        <Card className="mx-auto mt-20 max-w-sm min-w-1/3">
            <CardHeader className="flex flex-col items-start">
                <div className="mx-auto mb-6 h-16 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-60 animate-pulse rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
                <div className="h-12 w-96 max-w-full animate-pulse rounded bg-gray-200" />
            </CardContent>
        </Card>
    )
}

function LoginPageContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")
    const [showPasswordLogin, setShowPasswordLogin] = useState(false)

    const [passwordError, loginWithPassword, passwordPending] = useActionState<
        { emailError?: string; passwordError?: string } | undefined,
        FormData
    >(loginWithPasswordAction, { emailError: "", passwordError: "" })

    const [googlePending, startTransition] = useTransition()

    const handleGoogleLogin = () => {
        startTransition(async () => {
            await loginWithGoogleAction()
        })
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
                    className="h-12 w-full max-w-full"
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
                <div className="mt-2 text-center text-xs text-balance text-gray-500">
                    Utilisez votre adresse Google FARE (qui termine par
                    @fare-asso.fr)
                </div>

                <div className="flex w-96 max-w-full items-center justify-center py-6">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500">ou</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {showPasswordLogin ? (
                    <form action={loginWithPassword} className="space-y-3">
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" name="email" id="email" />
                        {passwordError?.emailError ? (
                            <div className="text-destructive text-sm font-medium">
                                {passwordError.emailError}
                            </div>
                        ) : null}

                        <Label htmlFor="password">Password</Label>
                        <Input type="password" name="password" id="password" />
                        {passwordError?.passwordError ? (
                            <div className="text-destructive text-sm font-medium">
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
                ) : (
                    <>
                        <Button
                            type="button"
                            className="h-12 w-full max-w-full"
                            variant="outline"
                            onClick={() => setShowPasswordLogin(true)}
                        >
                            <MailIcon />
                            Email et mot de passe
                        </Button>
                        <div className="mt-2 text-center text-xs text-balance text-gray-500">
                            Pour vous connecter avec un email et mot de passe.
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
