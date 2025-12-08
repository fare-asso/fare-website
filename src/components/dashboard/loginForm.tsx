"use client"

import { Input } from "../ui/input"
import { Label } from "../ui/label"
import loginAction from "@/actions/auth/loginAction"

import LoginButton from "./loginButton"
import { useActionState } from "react"

export default function LoginForm() {
    const [error, formAction] = useActionState<
        { emailError?: string; passwordError?: string } | undefined,
        any
    >(loginAction, { emailError: "", passwordError: "" })

    return (
        <form action={formAction} className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input type="email" name="email" id="email" />
            {error && error.emailError ? (
                <div className="text-sm font-medium text-destructive">
                    {error.emailError}
                </div>
            ) : null}

            <Label htmlFor="password">Password</Label>
            <Input type="password" name="password" id="password" />
            {error && error.passwordError ? (
                <div className="text-sm font-medium text-destructive">
                    {error.passwordError}
                </div>
            ) : null}
            <LoginButton />
        </form>
    )
}
