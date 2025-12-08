"use client"
import { clamp } from "@/helpers/math"
import { ChangeEvent, useState } from "react"

type NumberInputProps = {
    name: string
    min?: number
    max?: number
    step?: number
    defaultValue?: number
    placeholder?: string
    className?: string
    onChange?: (value: number) => void
}

export default function NumberInput({
    name,
    min = 0,
    max = 999999999,
    step = 1,
    defaultValue = 0,
    placeholder = "0",
    className,
    onChange
}: NumberInputProps) {
    const [number, setNumber] = useState<number>(defaultValue)

    const updateNumber = (newValue: number) => {
        const clampedValue = clamp(newValue, min, max)
        setNumber(clampedValue)
        if (onChange) {
            onChange(clampedValue)
        }
    }

    const decrement = () => {
        updateNumber(number - step)
    }

    const increment = () => {
        updateNumber(number + step)
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(event.target.value)
        if (!isNaN(newValue)) {
            updateNumber(newValue)
        }
    }

    return (
        <div className={"relative flex max-w-[8rem] items-center " + className}>
            <button
                type="button"
                onClick={decrement}
                disabled={number === min}
                className="h-11 rounded-s-lg border border-gray-300 bg-gray-100 p-3 hover:bg-gray-200 focus:outline-hidden focus:ring-2 focus:ring-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
            >
                <svg
                    className="h-3 w-3 text-gray-900 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 2"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 1h16"
                    />
                </svg>
            </button>
            <input
                type="text"
                id={name}
                name={name}
                min={min}
                max={max}
                onChange={handleChange}
                className="block h-11 w-full rounded-none! border-x-0 border-y border-gray-300 bg-gray-50 py-2.5 text-center text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder={placeholder}
                value={number}
                required
            />
            <button
                type="button"
                onClick={increment}
                disabled={number === max}
                className="h-11 rounded-e-lg border border-gray-300 bg-gray-100 p-3 hover:bg-gray-200 focus:outline-hidden focus:ring-2 focus:ring-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
            >
                <svg
                    className="h-3 w-3 text-gray-900 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 1v16M1 9h16"
                    />
                </svg>
            </button>
        </div>
    )
}
