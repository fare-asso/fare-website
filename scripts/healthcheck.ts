import process from "node:process"

fetch("http://127.0.0.1:3000/api/health")
    .then((res) => {
        process.exit(res.ok ? 0 : 1)
    })
    .catch(() => {
        process.exit(1)
    })
