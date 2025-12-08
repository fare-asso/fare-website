import { ChangeEvent, ChangeEventHandler } from "react"

export default function AssociationMapSearchBar({
    value,
    onChange
}: {
    value: string
    onChange: ChangeEventHandler<HTMLInputElement>
}) {
    return (
        <input
            type="text"
            name="mapSearchBar"
            id="mapSearchBar"
            placeholder="Rechercher une association..."
            className="appearance-none rounded-full border border-black bg-white py-1.5 pl-7 pr-7 text-center text-gray-900 outline-hidden ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 md:w-[60%] lg:w-[40%]"
            value={value}
            onChange={onChange}
        />
    )
}
