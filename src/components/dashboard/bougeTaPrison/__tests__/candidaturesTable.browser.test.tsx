import type * as TanstackRouter from "@tanstack/react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import type { BTPTutorApplication } from "@/generated/prisma/client"
import { validTutorApplicationRecord } from "@/test/factories/bougeTaPrison"

const h = vi.hoisted(() => ({
    downloadAction: vi.fn(),
    bulkArchive: vi.fn(),
    downloadBase64: vi.fn(),
    noop: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    toastWarning: vi.fn(),
    invalidate: vi.fn()
}))

vi.mock("@tanstack/react-router", async (importOriginal) => ({
    ...(await importOriginal<typeof TanstackRouter>()),
    useRouter: () => ({ invalidate: h.invalidate })
}))
vi.mock("@/components/link", () => ({
    default: ({
        href,
        children,
        ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
        <a href={href} {...props}>
            {children}
        </a>
    )
}))

vi.mock("@/actions/bouge-ta-prison/downloadTutorApplicationsZipAction", () => ({
    downloadTutorApplicationsZipAction: h.downloadAction
}))
vi.mock("@/actions/bouge-ta-prison/bulkArchiveTutorApplicationsAction", () => ({
    bulkArchiveTutorApplicationsAction: h.bulkArchive
}))
vi.mock("@/lib/download", () => ({ downloadBase64: h.downloadBase64 }))
vi.mock("@/actions/bouge-ta-prison/archiveTutorApplication", () => ({
    archiveTutorApplicationAction: h.noop
}))
vi.mock("@/actions/bouge-ta-prison/unarchiveTutorApplication", () => ({
    unarchiveTutorApplicationAction: h.noop
}))
vi.mock("sonner", () => ({
    toast: {
        success: h.toastSuccess,
        error: h.toastError,
        warning: h.toastWarning
    }
}))

import CandidaturesTable from "../candidaturesTable"

const records: BTPTutorApplication[] = [
    validTutorApplicationRecord({
        id: 1,
        firstName: "Lea",
        lastName: "Martin"
    }),
    validTutorApplicationRecord({ id: 2, firstName: "Tom", lastName: "Durand" })
]

beforeEach(() => {
    h.downloadAction.mockReset()
    h.bulkArchive.mockReset()
    h.downloadBase64.mockReset()
    h.toastSuccess.mockReset()
    h.toastError.mockReset()
    h.toastWarning.mockReset()
    h.downloadAction.mockResolvedValue({
        success: true,
        zipData: "aGk=",
        filename: "candidatures-tutorat-2026-06-23.zip",
        missing: 0
    })
    h.bulkArchive.mockResolvedValue({ success: true, value: { count: 1 } })
})

describe("<CandidaturesTable />", () => {
    it("renders a row per candidate", async () => {
        const screen = await render(<CandidaturesTable data={records} />)
        await expect.element(screen.getByText("Lea Martin")).toBeVisible()
        await expect.element(screen.getByText("Tom Durand")).toBeVisible()
    })

    it("exposes each row as a real link to the detail page", async () => {
        const screen = await render(<CandidaturesTable data={records} />)
        await expect
            .element(screen.getByRole("link", { name: "Lea Martin" }))
            .toHaveAttribute(
                "href",
                "/dashboard/bouge-ta-prison/candidatures-tutorat/1"
            )
    })

    it("reveals the bulk bar when rows are selected", async () => {
        const screen = await render(<CandidaturesTable data={records} />)
        await screen
            .getByRole("checkbox", { name: "Sélectionner tout" })
            .click()
        await expect
            .element(screen.getByText(/2 candidatures sélectionnées/))
            .toBeVisible()
    })

    it("hides the bulk bar again when everything is deselected", async () => {
        const screen = await render(<CandidaturesTable data={records} />)
        const selectAll = screen.getByRole("checkbox", {
            name: "Sélectionner tout"
        })

        await selectAll.click()
        await expect
            .element(screen.getByText(/2 candidatures sélectionnées/))
            .toBeVisible()

        // Deselect everything → the bar must disappear.
        await selectAll.click()
        await expect
            .element(screen.getByText(/candidatures? sélectionnées?/))
            .not.toBeInTheDocument()

        // Reselecting brings it back (no stale render).
        await selectAll.click()
        await expect
            .element(screen.getByText(/2 candidatures sélectionnées/))
            .toBeVisible()
    })

    it("downloads the selected candidatures as a zip", async () => {
        const screen = await render(<CandidaturesTable data={records} />)
        await screen
            .getByRole("checkbox", { name: "Sélectionner tout" })
            .click()
        await screen.getByRole("button", { name: /Télécharger/ }).click()

        await vi.waitFor(() =>
            expect(h.downloadAction).toHaveBeenCalledWith({ data: [1, 2] })
        )
        expect(h.downloadBase64).toHaveBeenCalledWith(
            "aGk=",
            "candidatures-tutorat-2026-06-23.zip",
            "application/zip"
        )
        expect(h.toastSuccess).toHaveBeenCalled()
    })

    it("warns on a partial download", async () => {
        h.downloadAction.mockResolvedValue({
            success: true,
            zipData: "aGk=",
            filename: "candidatures-tutorat-2026-06-23.zip",
            missing: 2
        })
        const screen = await render(<CandidaturesTable data={records} />)
        await screen
            .getByRole("checkbox", { name: "Sélectionner tout" })
            .click()
        await screen.getByRole("button", { name: /Télécharger/ }).click()

        await vi.waitFor(() => expect(h.toastWarning).toHaveBeenCalled())
        expect(h.toastSuccess).not.toHaveBeenCalled()
    })

    it("blocks downloading beyond the selection cap", async () => {
        const many = Array.from({ length: 76 }, (_, i) =>
            validTutorApplicationRecord({
                id: i + 1,
                firstName: `F${i}`,
                lastName: `L${i}`
            })
        )
        const screen = await render(<CandidaturesTable data={many} />)
        await screen
            .getByRole("checkbox", { name: "Sélectionner tout" })
            .click()

        await expect
            .element(screen.getByText(/limité à 75 candidatures/))
            .toBeVisible()
        await expect
            .element(screen.getByRole("button", { name: /Télécharger/ }))
            .toBeDisabled()
        expect(h.downloadAction).not.toHaveBeenCalled()
    })

    it("bulk-archives the selected candidatures after confirmation", async () => {
        const screen = await render(<CandidaturesTable data={records} />)
        await screen
            .getByRole("checkbox", { name: "Sélectionner la ligne" })
            .first()
            .click()
        // open the confirmation dialog (distinct label from the row actions),
        // then confirm inside the dialog
        await screen
            .getByRole("button", { name: "Archiver la sélection" })
            .click()
        await screen
            .getByRole("alertdialog")
            .getByRole("button", { name: "Archiver" })
            .click()

        await vi.waitFor(() =>
            expect(h.bulkArchive).toHaveBeenCalledWith({
                data: { ids: [1], archive: true }
            })
        )
        expect(h.toastSuccess).toHaveBeenCalled()
    })

    it("bulk-unarchives on the archived tab", async () => {
        const screen = await render(
            <CandidaturesTable data={records} archived />
        )
        await screen
            .getByRole("checkbox", { name: "Sélectionner la ligne" })
            .first()
            .click()
        await screen
            .getByRole("button", { name: "Désarchiver la sélection" })
            .click()
        await screen
            .getByRole("alertdialog")
            .getByRole("button", { name: "Désarchiver" })
            .click()

        await vi.waitFor(() =>
            expect(h.bulkArchive).toHaveBeenCalledWith({
                data: { ids: [1], archive: false }
            })
        )
        expect(h.toastSuccess).toHaveBeenCalled()
    })
})
