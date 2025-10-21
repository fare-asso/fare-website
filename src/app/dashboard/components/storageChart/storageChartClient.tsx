"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

/**
 * Chart component for displaying storage usage in a pie chart format.
 * The unit of measurement is in gigabytes (GB).
 * @param {number} used - The amount of storage used in GB.
 * @param {number} total - The total storage capacity in GB.
 * @returns {JSX.Element} - A pie chart representing the storage usage.
 */
export function StorageChartClient({
    used,
    total,
}: {
    used: number;
    total: number;
}): React.ReactElement {
    const chartData = [
        { name: "Utilisé", value: used, fill: "#304bb7e5" },
        { name: "Libre", value: total - used, fill: "#566cae26" },
    ];

    const chartConfig = {
        used: {
            label: "Used",
            color: "hsl(var(--chart-1))",
        },
        available: {
            label: "Available",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig;

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
                                            {used.toFixed(2)} Go
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground text-sm"
                                        >
                                            utilisés
                                        </tspan>
                                    </text>
                                );
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}
