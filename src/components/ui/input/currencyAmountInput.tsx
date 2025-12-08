"use client"

import { ChangeEvent, useState } from "react"
import { Input } from "../input"
import { Label } from "../label"

export default function CurrencyAmountInput({
    name,
    currency,
    defaultValue,
    placeholder
}: {
    name: string
    currency: string
    defaultValue?: number
    placeholder?: string
}) {
    const [amount, setAmount] = useState(defaultValue?.toString() ?? "0")

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        if (!isNaN(Number(e.target.value)) || e.target.value == ".") {
            setAmount(e.target.value)
        }
    }

    return (
        <div className="flex flex-row items-center">
            <Input
                type="text"
                name={name}
                id={name}
                className="w-[15%] rounded-r-none border-r-0 pr-2"
                placeholder={placeholder ?? "0"}
                onChange={handleChange}
                value={amount}
            />
            <span className="select-none rounded-r-lg bg-black/10 px-3 py-2 opacity-90">
                {currency}
            </span>
        </div>
    )
}
