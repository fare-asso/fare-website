"use client";

import { ChangeEvent, useState } from "react";
import { Input } from "../input";
import { Label } from "../label";

export default function CurrencyAmountInput({
    name,
    currency,
    defaultValue,
    placeholder,
}: {
    name: string;
    currency: string;
    defaultValue?: number;
    placeholder?: string;
}) {
    const [amount, setAmount] = useState(defaultValue?.toString() ?? "0");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (!isNaN(Number(e.target.value)) || e.target.value == ".") {
            setAmount(e.target.value);
        }
    };

    return (
        <div className="flex flex-row items-center">
            <Input
                type="text"
                name={name}
                id={name}
                className="border-r-0 rounded-r-none pr-2 w-[15%]"
                placeholder={placeholder ?? "0"}
                onChange={handleChange}
                value={amount}
            />
            <span className="opacity-90 select-none py-2 px-3 bg-black/10 rounded-r-lg">
                {currency}
            </span>
        </div>
    );
}
