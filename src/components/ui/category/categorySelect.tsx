"use client"

import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select"

import { useState, useEffect } from "react"

interface Category {
    id: number,
    name: string
}

export default function CategorySelect({defaultValue} : {defaultValue : string}) {

    const [categoryItems, setCategoryItems] = useState<JSX.Element>(<></>);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const items = data.categories.map((category: Category) => <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>)
                setCategoryItems(
                    <>
                    {items}
                    </>
                );
            } catch (error) {
                console.error(error)
            }
        }

        fetchCategories();
    }, []);

    // const categoriesItems = categories.map((category) => <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>)    

    return(
        <Select name="category" defaultValue={defaultValue}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
                {categoryItems}
            </SelectContent>
        </Select>
    )

}