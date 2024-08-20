'use client';

import { clamp } from "@/helpers/math";
import { ChangeEvent, useState } from "react";

export default function NumberInput({name, min, max, step, defaultValue, placeholder} :{name: string, min?: number, max?: number, step?: number, defaultValue?: number, placeholder?: string}) {

    const [number, setNumber] = useState<number>(defaultValue ?? 0);

    const decrement = () => {
        setNumber(clamp(number - (step ?? 1), min ?? -999999999, max ?? 999999999));
    }

    const increment = () => {
        setNumber(clamp(number + (step ?? 1), min ?? -999999999, max ?? 999999999));
    }
    
    const handleChange = (event : ChangeEvent<HTMLInputElement>) => {
        if(!isNaN(Number(event.target.value))) {
            setNumber(Math.max(0, Number(event.target.value)))
        }
    }

    return(
        <div className="relative flex items-center max-w-[8rem]">
            <button type="button" onClick={decrement} className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16"/>
                </svg>
            </button>
            <input type="text" id={name} name={name} min={min} max={max} onChange={handleChange} className="bg-gray-50 !rounded-none border-x-0 border-y border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={placeholder ?? "0"} value={number} required />
            <button type="button" onClick={increment} className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
                </svg>
            </button>
        </div>
)
}