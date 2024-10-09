
export const MPESA_CONFIG = process.env.NODE_ENV == "production" ? {
    baseUrl: `https://api.safaricom.co.ke`,
    consumerKey: process.env.MPESA_PROD_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_PROD_CONSUMER_SECRET,
    shortCode: process.env.MPESA_PROD_SHORTCODE,
    passKey: process.env.MPESA_PROD_PASSKEY,
    callbackUrl: process.env.MPESA_PROD_STK_CALLBACK_URL,
    requestTimeout: 5000
} : {
    // Development configs
    baseUrl: `https://sandbox.safaricom.co.ke`,
    consumerKey: process.env.MPESA_DEV_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_DEV_CONSUMER_SECRET,
    shortCode: process.env.MPESA_DEV_SHORTCODE,
    passKey: process.env.MPESA_DEV_PASSKEY,
    callbackUrl: process.env.MPESA_DEV_STK_CALLBACK_URL,
    requestTimeout: 5000
}