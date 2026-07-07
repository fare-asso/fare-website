import { useServerFn } from "@tanstack/react-start"
import { LoaderIcon, MailIcon } from "lucide-react"
import { useState, useTransition } from "react"
import { FcGoogle } from "react-icons/fc"

import {
    loginWithGoogleAction,
    loginWithPasswordAction
} from "@/actions/auth/loginAction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginWithGoogleButton() {
    const [googlePending, startTransition] = useTransition()
    const loginWithGoogle = useServerFn(loginWithGoogleAction)

    const handleGoogleLogin = () => {
        startTransition(async () => {
            await loginWithGoogle()
            // The OAuth redirect is in flight: keep the pending state until
            // the browser leaves the page. An error above ends the transition.
            await new Promise(() => {})
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
    const [passwordError, setPasswordError] = useState<
        { emailError?: string; passwordError?: string } | undefined
    >(undefined)
    const [passwordPending, startTransition] = useTransition()
    const loginWithPasswordFn = useServerFn(loginWithPasswordAction)

    const loginWithPassword = (formData: FormData) => {
        startTransition(async () => {
            const result = await loginWithPasswordFn(formData)
            setPasswordError(result)
        })
    }

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

                <Label htmlFor="password">Mot de passe</Label>
                <Input type="password" name="password" id="password" />
                {passwordError?.passwordError && (
                    <div className="text-destructive text-sm font-medium">
                        {passwordError.passwordError}
                    </div>
                )}
                <Button disabled={passwordPending} type="submit">
                    {passwordPending ? (
                        <>
                            <LoaderIcon className="animation-duration-[1500ms] animate-spin" />
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
