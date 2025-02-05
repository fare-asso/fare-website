export default function QuestionList() {
    return (
        <div className="flex h-full flex-col items-center space-y-2 rounded-lg border p-4 shadow-sm">
            {[].length > 0 ?
                // applications.map((application) => (
                //     <ApplicationCard
                //         application={application}
                //         key={application.id}
                //     />
                // ))
                <span>Quelques candidatures</span>
            :   <span className="text-sm opacity-50">
                    Il n'y a pas encore de questions.😔
                </span>
            }
        </div>
    );
}
