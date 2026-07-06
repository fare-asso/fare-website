import type { Metadata } from "next"

import CalculateurBeneficiaire from "@/components/public/agorae/calculateurBeneficiaire"

export const metadata: Metadata = {
    title: "AGORAé - Calculateur bénéficiaire"
}

export default function Page() {
    return <CalculateurBeneficiaire />
}
