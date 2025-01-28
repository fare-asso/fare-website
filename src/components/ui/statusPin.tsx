export type Status = "active" | "inactive" | "pending" | "disabled";

export default function StatusPin({ status }: { status: Status }) {
    switch (status) {
        case "active":
            return <div className="h-3 w-3 rounded-full bg-green-400"></div>;
        case "pending":
            return <div className="h-3 w-3 rounded-full bg-yellow-400"></div>;
        case "inactive":
            return <div className="h-3 w-3 rounded-full bg-red-400"></div>;
        case "disabled":
            return <div className="h-3 w-3 rounded-full bg-gray-400"></div>;
    }
}
