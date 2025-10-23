import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nos partenaires | FARE",
    description: "Page des partenariats de la FARE",
};

export default async function Partenariats() {
    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-12 text-[3rem] font-semibold sm:py-24 md:py-32 lg:py-44">
                Nos partenaires
            </h1>

            <div className="flex flex-col"></div>
        </div>
    );
}
