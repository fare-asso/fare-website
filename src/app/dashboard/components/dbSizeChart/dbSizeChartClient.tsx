"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart"

/**
 * Chart component for displaying database size in a pie chart format.
 * The unit of measurement is in gigabytes (GB).
 * @param {number} size - The database size used in GB.
 * @param {number} total - The total database capacity in GB.
 * @returns {JSX.Element} - A pie chart representing the storage usage.
 */
export function DbSizeChartClient({
    size,
    total
}: {
    size: number
    total: number
}): React.ReactElement {
    const chartData = [
        { name: "Utilisé", value: size, fill: "#be8345" },
        { name: "Libre", value: total - size, fill: "#f3f2e6" }
    ]

    const chartConfig = {
        used: {
            label: "Used",
            color: "hsl(var(--chart-1))"
        },
        free: {
            label: "Free",
            color: "hsl(var(--chart-2))"
        }
    } satisfies ChartConfig

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
        >
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                    fill="#8884d8"
                >
                    <Label
                        content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground text-3xl font-bold"
                                        >
                                            {(size * 1024).toFixed(0)} Mo
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground text-sm"
                                        >
                                            utilisés
                                        </tspan>
                                    </text>
                                )
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    )
}
