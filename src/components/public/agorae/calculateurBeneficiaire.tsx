"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CalculateurBeneficiaire() {
    const [recettes, setRecettes] = useState("");
    const [depenses, setDepenses] = useState("");
    const [rav, setRav] = useState<number>(0);

    useEffect(() => {
        if (recettes && depenses) {
            const ravJournalier: number =
                (parseFloat(recettes) - parseFloat(depenses)) / 30;
            setRav(ravJournalier);
        }
    }, [recettes, depenses]);

    const determinerPanier = (ravJournalier: number) => {
        if (ravJournalier > 7.5) {
            return {
                montantPanier: "10€",
                prixPaye: "1€",
                classe: "bg-green-50",
            };
        } else if (ravJournalier >= 0.7 && ravJournalier <= 7.5) {
            return {
                montantPanier: "jusqu'à 240€",
                prixPaye: "jusqu'à 24€",
                classe: "bg-yellow-50",
            };
        } else {
            return {
                montantPanier: "selon le besoin",
                prixPaye: "0€",
                classe: "bg-red-50",
            };
        }
    };

    const computeRavColor = () => {
        if (rav > 7.5) {
            return "text-green-500";
        } else if (rav >= 0.7 && rav <= 7.5) {
            return "text-orange-500";
        } else {
            return "text-red-500";
        }
    };

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>Calculateur d'éligibilité AGORAÉ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="recettes">Recettes par mois (€)</Label>
                        <Input
                            id="recettes"
                            type="number"
                            value={recettes}
                            onChange={(e) => setRecettes(e.target.value)}
                            placeholder="Entrez vos recettes mensuelles"
                        />
                    </div>

                    <div>
                        <Label htmlFor="depenses">Dépenses par mois (€)</Label>
                        <Input
                            id="depenses"
                            type="number"
                            value={depenses}
                            onChange={(e) => setDepenses(e.target.value)}
                            placeholder="Entrez vos dépenses mensuelles"
                        />
                    </div>
                </div>

                {rav !== null && (
                    <div className="space-y-4">
                        <Alert>
                            <AlertDescription
                                className={`${computeRavColor()}`}
                            >
                                Votre Reste à Vivre (RAV) quotidien est de :{" "}
                                {rav.toFixed(2)}€
                            </AlertDescription>
                        </Alert>

                        <Card
                            className={`${determinerPanier(rav).classe} border-none`}
                        >
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <p className="font-medium">
                                        Denrées en valeurs marchande :{" "}
                                        {determinerPanier(rav).montantPanier}
                                    </p>
                                    <p className="font-semibold">
                                        Prix payé à l'AGORAÉ :{" "}
                                        {determinerPanier(rav).prixPaye}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
