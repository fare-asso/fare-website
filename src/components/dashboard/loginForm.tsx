"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import loginAction from "@/actions/auth/loginAction";

import { useFormState } from "react-dom";
import LoginButton from "./loginButton";

export default function LoginForm() {
    const [error, formAction] = useFormState<
        { emailError?: string; passwordError?: string } | undefined,
        any
    >(loginAction, { emailError: "", passwordError: "" });

    return (
        <form action={formAction} className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input type="email" name="email" id="email" />
            {error && error.emailError ?
                <div className="text-sm font-medium text-destructive">
                    {error.emailError}
                </div>
            :   null}

            <Label htmlFor="password">Password</Label>
            <Input type="password" name="password" id="password" />
            {error && error.passwordError ?
                <div className="text-sm font-medium text-destructive">
                    {error.passwordError}
                </div>
            :   null}
            <LoginButton />
        </form>
    );
}
