import { useState } from "react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Panier {
    montantPanier: string
    prixPaye: string
    ravClasse: string
}

function determinerPanier(rav: number): Panier {
    if (rav > 7.5) {
        return {
            montantPanier: "10€",
            prixPaye: "1€",
            ravClasse: "text-green-600"
        }
    }
    if (rav >= 0.7) {
        return {
            montantPanier: "jusqu'à 240€",
            prixPaye: "jusqu'à 24€",
            ravClasse: "text-orange-500"
        }
    }
    return {
        montantPanier: "selon le besoin",
        prixPaye: "0€",
        ravClasse: "text-red-500"
    }
}

export default function CalculateurBeneficiaire() {
    const [recettes, setRecettes] = useState("")
    const [depenses, setDepenses] = useState("")

    const brut =
        recettes && depenses
            ? (Number.parseFloat(recettes) - Number.parseFloat(depenses)) / 30
            : Number.NaN
    const rav = Number.isFinite(brut) ? brut : null
    const panier = rav === null ? null : determinerPanier(rav)

    return (
        <Card className="border-agorae/25 mx-auto w-full max-w-lg border-2">
            <CardHeader>
                <CardTitle>Calcule ton éligibilité</CardTitle>
                <CardDescription>
                    Renseigne tes recettes et dépenses mensuelles pour estimer
                    ton Reste à Vivre et le panier auquel tu as droit.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="recettes">Recettes par mois (€)</Label>
                        <Input
                            id="recettes"
                            type="number"
                            min="0"
                            value={recettes}
                            onChange={(e) => setRecettes(e.target.value)}
                            placeholder="Bourse, salaire, aides…"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="depenses">Dépenses par mois (€)</Label>
                        <Input
                            id="depenses"
                            type="number"
                            min="0"
                            value={depenses}
                            onChange={(e) => setDepenses(e.target.value)}
                            placeholder="Loyer, factures, transport…"
                        />
                    </div>
                </div>

                {/* native live region: the browser announces changes itself */}
                <div aria-live="polite" aria-atomic="true">
                    {rav === null || panier === null ? (
                        <p className="text-muted-foreground text-center text-sm">
                            Remplis les deux champs pour voir ton résultat.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-muted-foreground text-sm">
                                    Ton Reste à Vivre (RAV) quotidien
                                </p>
                                <p
                                    className={cn(
                                        "text-3xl font-bold",
                                        panier.ravClasse
                                    )}
                                >
                                    {rav.toFixed(2)}€
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="bg-agorae/5 rounded-xl p-4 text-center">
                                    <p className="text-muted-foreground text-sm">
                                        Denrées en valeur marchande
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {panier.montantPanier}
                                    </p>
                                </div>
                                <div className="bg-agorae/5 rounded-xl p-4 text-center">
                                    <p className="text-muted-foreground text-sm">
                                        Prix payé à l'AGORAé
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {panier.prixPaye}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
