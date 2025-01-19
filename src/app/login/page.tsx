"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import LoginForm from "@/components/dashboard/loginForm";

export default function LoginPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Connexion Admin</CardTitle>
                <CardDescription>
                    Accès réservé uniquement aux membres de la fédération
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm></LoginForm>
            </CardContent>
        </Card>
    );
}
