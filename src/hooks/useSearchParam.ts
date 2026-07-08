import { useCallback, useSyncExternalStore } from "react"

function subscribe(callback: () => void): () => void {
    window.addEventListener("popstate", callback)
    window.addEventListener("searchparamchange", callback)
    return () => {
        window.removeEventListener("popstate", callback)
        window.removeEventListener("searchparamchange", callback)
    }
}

export function useSearchParam(
    key: string,
    defaultValue: string
): [string, (value: string) => void] {
    const value = useSyncExternalStore(
        subscribe,
        () =>
            new URLSearchParams(window.location.search).get(key) ??
            defaultValue,
        () => defaultValue
    )

    const setValue = useCallback(
        (next: string) => {
            const url = new URL(window.location.href)
            url.searchParams.set(key, next)
            history.replaceState(null, "", url)
            window.dispatchEvent(new Event("searchparamchange"))
        },
        [key]
    )

    return [value, setValue]
}
