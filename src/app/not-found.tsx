export default function NotFoundPage() {
    return (
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
            <span className="text-center text-[6rem] font-bold leading-[0.9]">
                <span className="transition-all duration-100 hover:text-[8rem]">
                    404
                </span>{" "}
                page non trouvée
            </span>
            <span className="mt-10 text-2xl opacity-50">
                {"C'est moins que le loyer moyen d'un studio T1 à Rennes"}
            </span>
        </div>
    );
}
