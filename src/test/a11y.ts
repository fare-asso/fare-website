import axe from "axe-core"
import { expect } from "vitest"

// Component tests render without the Tailwind stylesheet: colour contrast and
// target sizes are verified live against the dev server (see ACCESSIBILITY.md).
export async function expectNoA11yViolations(
    node: Element = document.body
): Promise<void> {
    const results = await axe.run(node, {
        runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
        },
        rules: {
            "color-contrast": { enabled: false },
            "target-size": { enabled: false }
        }
    })
    expect(
        results.violations.map((v) => ({
            id: v.id,
            help: v.help,
            nodes: v.nodes.map((n) => n.html)
        }))
    ).toEqual([])
}
