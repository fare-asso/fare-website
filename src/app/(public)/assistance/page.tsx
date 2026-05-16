import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Défense des droits étudiants",
    description:
        "Besoin d'aide pour défendre vos droits étudiants ? Prenez contact avec vos élus étudiants !",
    keywords: "défense, droit, étudiant, aide"
}

export default function Assistance() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h1>Défense des droits étudiants</h1>
                </CardTitle>
            </CardHeader>
            <CardContent></CardContent>
        </Card>
    )
}
