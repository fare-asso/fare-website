import type React from "react"
import { useEffect, useState } from "react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { tryCatch } from "@/lib/utils"

interface Category {
    id: number
    name: string
}

export default function CategorySelect({
    defaultValue
}: {
    defaultValue: string
}) {
    const [categoryItems, setCategoryItems] =
        useState<React.ReactElement | null>(null)

    useEffect(() => {
        const fetchCategories = async () => {
            const result = await tryCatch(async () => {
                const response = await fetch("/api/categories")
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                return (await response.json()) as { categories: Category[] }
            })
            if (!result.success) {
                console.error(result.error)
                return
            }
            setCategoryItems(
                <>
                    {result.value.categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.name}>
                            {category.name}
                        </SelectItem>
                    ))}
                </>
            )
        }

        void fetchCategories()
    }, [])

    // const categoriesItems = categories.map((category) => <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>)

    return (
        <Select name="category" defaultValue={defaultValue}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>{categoryItems}</SelectContent>
        </Select>
    )
}
