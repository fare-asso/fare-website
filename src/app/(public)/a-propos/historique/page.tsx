import type { Metadata } from "next"

import { HistoireFare } from "./histoire-fare"

export const metadata: Metadata = {
    title: "L'historique de la FARE"
}

export default function Historique(): React.JSX.Element {
    return <HistoireFare />
}
