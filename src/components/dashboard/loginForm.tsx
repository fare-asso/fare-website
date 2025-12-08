"use client"

import { useActionState } from "react"
import loginAction from "@/actions/auth/loginAction"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import LoginButton from "./loginButton"

export default function LoginForm() {
    const [error, formAction] = useActionState<
        { emailError?: string; passwordError?: string } | undefined,
        any
    >(loginAction, { emailError: "", passwordError: "" })

    return (
        <form action={formAction} className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input type="email" name="email" id="email" />
            {error?.emailError ? (
                <div className="font-medium text-destructive text-sm">
                    {error.emailError}
                </div>
            ) : null}

            <Label htmlFor="password">Password</Label>
            <Input type="password" name="password" id="password" />
            {error?.passwordError ? (
                <div className="font-medium text-destructive text-sm">
                    {error.passwordError}
                </div>
            ) : null}
            <LoginButton />
        </form>
    )
}
