import dotenv from "dotenv"
dotenv.config()

let node_env = process.env.NODE_ENV || "development"

let env: Record<string, any> = {
    development: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.MONGO_URL as string
    },
    production: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.MONGO_URL as string
    },
    test: {
        THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY as string,
        AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY as string,
        MONGO_URL: process.env.MONGO_URL as string
    }
}

export default env[node_env]