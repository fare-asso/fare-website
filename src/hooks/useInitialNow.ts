import { useState } from "react"

export function useInitialNow(): Date {
    const [now] = useState(() => new Date())
    return now
}
