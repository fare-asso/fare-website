import { ChangeEvent, ChangeEventHandler } from "react";

export default function AssociationMapSearchBar({
    value,
    onChange,
}: {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
}) {
    return (
        <input
            type="text"
            name="mapSearchBar"
            id="mapSearchBar"
            placeholder="Rechercher une association..."
            className="md:w-[60%] lg:w-[40%] rounded-full bg-white border-black border
        py-1.5 pl-7 pr-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 appearance-none text-center outline-none"
            value={value}
            onChange={onChange}
        />
    );
}
