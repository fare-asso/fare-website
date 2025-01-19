import BugReportForm from "@/components/public/bug-report/form";

export default function BugReport() {
    return (
        <div className="flex flex-col items-center justify-start w-full">
            <h1 className="py-12 sm:py-24 md:py-32 lg:py-44 text-[3rem] font-semibold">
                {"Rapporter un bug"}
            </h1>

            {/* Formulaire de rapport de bug */}
            <BugReportForm />
        </div>
    );
}
