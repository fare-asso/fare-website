"use client";
import { clamp } from "@/helpers/math";
import { ChangeEvent, useState } from "react";

type NumberInputProps = {
    name: string;
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    placeholder?: string;
    className?: string;
    onChange?: (value: number) => void;
};

export default function NumberInput({
    name,
    min = 0,
    max = 999999999,
    step = 1,
    defaultValue = 0,
    placeholder = "0",
    className,
    onChange,
}: NumberInputProps) {
    const [number, setNumber] = useState<number>(defaultValue);

    const updateNumber = (newValue: number) => {
        const clampedValue = clamp(newValue, min, max);
        setNumber(clampedValue);
        if (onChange) {
            onChange(clampedValue);
        }
    };

    const decrement = () => {
        updateNumber(number - step);
    };

    const increment = () => {
        updateNumber(number + step);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(event.target.value);
        if (!isNaN(newValue)) {
            updateNumber(newValue);
        }
    };

    return (
        <div className={"relative flex items-center max-w-[8rem] " + className}>
            <button
                type="button"
                onClick={decrement}
                disabled={number === min}
                className="disabled:pointer-events-none disabled:opacity-50 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
            >
                <svg
                    className="w-3 h-3 text-gray-900 dark:text-white"
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
                className="bg-gray-50 !rounded-none border-x-0 border-y border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={placeholder}
                value={number}
                required
            />
            <button
                type="button"
                onClick={increment}
                disabled={number === max}
                className="disabled:pointer-events-none disabled:opacity-50 bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
            >
                <svg
                    className="w-3 h-3 text-gray-900 dark:text-white"
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
    );
}
