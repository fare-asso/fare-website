"use client"

import { LoaderIcon, MailIcon } from "lucide-react"
import { useActionState, useState, useTransition } from "react"
import { FcGoogle } from "react-icons/fc"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { loginWithGoogleAction, loginWithPasswordAction } from "./loginAction"

export function LoginWithGoogleButton() {
    const [googlePending, startTransition] = useTransition()

    const handleGoogleLogin = () => {
        startTransition(async () => {
            await loginWithGoogleAction()
        })
    }

    return (
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
    )
}

export function LoginWithPasswordButton() {
    const [showPasswordLogin, setShowPasswordLogin] = useState(false)

    const [passwordError, loginWithPassword, passwordPending] = useActionState<
        { emailError?: string; passwordError?: string } | undefined,
        FormData
    >(loginWithPasswordAction, { emailError: "", passwordError: "" })

    if (showPasswordLogin) {
        return (
            <form action={loginWithPassword} className="space-y-3">
                <Label htmlFor="email">Email</Label>
                <Input type="email" name="email" id="email" />
                {passwordError?.emailError && (
                    <div className="text-destructive text-sm font-medium">
                        {passwordError.emailError}
                    </div>
                )}

                <Label htmlFor="password">Password</Label>
                <Input type="password" name="password" id="password" />
                {passwordError?.passwordError && (
                    <div className="text-destructive text-sm font-medium">
                        {passwordError.passwordError}
                    </div>
                )}
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
        )
    }

    return (
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
    )
}
