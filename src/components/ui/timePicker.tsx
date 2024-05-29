'use client';

import { Input } from "./input"

type Time = {
    hours: number,
    minutes: number
}

/**
 * @param {Time} defaultValue - Default hour and minutes of the inputs
 * @param {string} hoursInputName - name of the hours input field
 * @param {string} minutesInputName - name of the minutes input field
 * @return {JSX.Element} two inputs wrapped in a container
 * 
*/
export default function TimePicker({defaultValue, hoursInputName, minutesInputName} : {defaultValue: Time, hoursInputName : string, minutesInputName : string}) {
    return(
        <div className="flex flex-row items-center justify-start space-x-2">
            <Input type="text" id="hours" name={hoursInputName} placeholder="00" pattern="\d*" defaultValue={defaultValue.hours.toString().padStart(2, '0')} className="w-1/6 text-center"/>
            <span className="text-xl">:</span>
            <Input type="text" id="minutes" name={minutesInputName} placeholder="00" pattern="\d*" defaultValue={defaultValue.minutes.toString().padStart(2, '0')} className="w-1/6 flex flex-col items-center text-center"/>
        </div>
    )
}