"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FormState, SubmitHandler, useForm } from "react-hook-form";
import loginAction from "@/app/login/loginAction";

import { useFormState } from "react-dom";
import LoginButton from "./loginButton";

export default function LoginForm() {

    const [error, formAction] = useFormState(loginAction, {usernameError: "", passwordError: ""});

    return(
        <form action={formAction} className="space-y-3">
            <Label htmlFor="username">Username</Label>
            <Input type="text" name="username" id="username" />
            { error.usernameError ? <div className="text-sm font-medium text-destructive">{error.usernameError}</div> : null}

            <Label htmlFor="password">Password</Label>
            <Input type="password" name="password" id="password" />
            { error.passwordError ? <div className="text-sm font-medium text-destructive">{error.passwordError}</div> : null}
            <LoginButton/>
        </form>
    )
}