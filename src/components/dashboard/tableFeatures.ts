import {
    columnVisibilityFeature,
    rowSelectionFeature,
    tableFeatures
} from "@tanstack/react-table"

export const dashboardTableFeatures = tableFeatures({
    columnVisibilityFeature,
    rowSelectionFeature
})
export type DashboardTableFeatures = typeof dashboardTableFeatures
