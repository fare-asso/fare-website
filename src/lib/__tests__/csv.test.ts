import { describe, expect, it } from "vitest"

import { parseCsv } from "../csv"

describe("parseCsv", () => {
    it("parses a simple row", () => {
        expect(parseCsv("a,b,c")).toEqual([["a", "b", "c"]])
    })

    it("parses multiple rows separated by \\n", () => {
        expect(parseCsv("a,b\nc,d")).toEqual([
            ["a", "b"],
            ["c", "d"]
        ])
    })

    it("handles \\r\\n line endings", () => {
        expect(parseCsv("a,b\r\nc,d")).toEqual([
            ["a", "b"],
            ["c", "d"]
        ])
    })

    it("handles a lone \\r line ending", () => {
        expect(parseCsv("a\rb")).toEqual([["a"], ["b"]])
    })

    it("keeps commas inside quoted fields", () => {
        expect(parseCsv('"a,b",c')).toEqual([["a,b", "c"]])
    })

    it("unescapes doubled quotes inside quoted fields", () => {
        expect(parseCsv('"a""b",c')).toEqual([['a"b', "c"]])
    })

    it("preserves newlines inside quoted fields", () => {
        expect(parseCsv('"a\nb",c')).toEqual([["a\nb", "c"]])
    })

    it("ignores a trailing newline", () => {
        expect(parseCsv("a,b\n")).toEqual([["a", "b"]])
    })

    it("skips blank lines", () => {
        expect(parseCsv("a\n\nb")).toEqual([["a"], ["b"]])
    })

    it("returns an empty array for empty input", () => {
        expect(parseCsv("")).toEqual([])
    })
})
