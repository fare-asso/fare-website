
export type Status = "active" | "inactive" | "pending" | "disabled"

export default function StatusPin({status} : {status: Status}) {
    
    switch (status) {
        case "active":
            return <div className="rounded-full w-3 h-3 bg-green-400"></div>
        case "pending":
            return <div className="rounded-full w-3 h-3 bg-yellow-400"></div>
        case "inactive":
            return <div className="rounded-full w-3 h-3 bg-red-400"></div>
        case "disabled":
            return <div className="rounded-full w-3 h-3 bg-gray-400"></div>
    }
}