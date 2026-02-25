import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EspaceAssoPage() {
    return (
        <div className="w-full max-w-4xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bienvenue dans l'Espace Asso</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertTitle>En cours de développement</AlertTitle>
                        <AlertDescription>
                            L'espace association est actuellement en cours de
                            développement. Les fonctionnalités suivantes seront
                            bientôt disponibles :
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>
                                    Gestion des informations de l'association
                                </li>
                                <li>Suivi des adhésions</li>
                                <li>Accès aux documents et ressources</li>
                                <li>Communication avec la FARE</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    )
}
