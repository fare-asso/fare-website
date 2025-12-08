import BugReportForm from "@/components/public/bug-report/form"

export default function BugReport() {
    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-12 font-semibold text-[3rem] sm:py-24 md:py-32 lg:py-44">
                {"Rapporter un bug"}
            </h1>

            {/* Formulaire de rapport de bug */}
            <BugReportForm />
        </div>
    )
}
