import { createFileRoute } from "@tanstack/react-router"

import CalculateurBeneficiaire from "@/components/public/agorae/calculateurBeneficiaire"
import { pageTitle } from "@/lib/seo"

export const Route = createFileRoute(
    "/_public/projets/agorae/calculateur-beneficiaire/"
)({
    head: () => ({
        meta: [{ title: pageTitle("AGORAé - Calculateur bénéficiaire") }]
    }),
    component: CalculateurBeneficiaire
})
