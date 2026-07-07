// Browser-test stub for @tanstack/react-start/server request-context utils.
export function getCookies(): Record<string, string> {
    return {}
}

export function setCookie(
    _name: string,
    _value: string,
    _options?: Record<string, unknown>
): void {}

export function getRequestHeader(_name: string): string | undefined {
    return undefined
}
