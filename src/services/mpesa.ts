import config from "../config/env";
import axios, { AxiosInstance } from "axios";
import { Business } from "../models/businessModel";
import { time } from "console";
import { Timestamp } from "mongodb";
import { delay } from "./utils";

let cachedAccessToken: { accessToken: string, expiry: number } = { accessToken: '', expiry: 0 }

const getAccessToken = async () => {
    // Check if the token is still valid
    if (cachedAccessToken.accessToken && cachedAccessToken.expiry > Date.now()) {
        return cachedAccessToken.accessToken;
    }

    const auth = 'Basic ' + Buffer.from(config.MPESA_CONSUMER_KEY + ':' + config.MPESA_CONSUMER_SECRET).toString('base64');
    const { data } = await axios.get(`${config.MPESA_BASEURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
            Authorization: auth,
        },
    });

    if (data && data.access_token && data.expires_in) {
        cachedAccessToken = { accessToken: data.access_token, expiry: Date.now() + data.expires_in * 1000 }

        return data.access_token
    } else {
        throw new Error("Invalid token response format")
    }
}


const mpesaClient = async (): Promise<AxiosInstance> => {
    const accessToken = await getAccessToken()

    if (!accessToken) throw new Error("Could not get access token")

    return axios.create({
        baseURL: config.MPESA_BASEURL,
        timeout: config.MPESA_REQUEST_TIMEOUT,
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        }
    })
}

const mpesaExpressQuery = async (client: AxiosInstance, businessShortCode: string, password: string, timestamp: string, checkoutRequestId: string) => {
    const queryData = {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
    }
    const { data } = await client.post("/mpesa/stkpushquery/v1/query", queryData)
    return data
}

export const initiateSTKPush = async (senderPhoneNumber: string, businessShortCode: string, amount: number, accountRef: string, user: string, transactionType = 'CustomerPayBillOnline', transactionDesc = 'Lipa na mpesa online') => {
    try {
        const client = await mpesaClient()

        const timeStamp = (new Date()).toISOString().replace(/[^0-9]/g, '').slice(0, -3)
        const password = Buffer.from(`${config.MPESA_SHORTCODE}${config.MPESA_PASSKEY}${timeStamp}`).toString('base64')

        const stkData = {
            BusinessShortCode: businessShortCode,
            Password: password,
            Timestamp: timeStamp,
            TransactionType: transactionType,
            Amount: amount,
            PartyA: senderPhoneNumber,
            PartyB: config.MPESA_SHORTCODE,
            PhoneNumber: senderPhoneNumber,
            CallBackURL: `${config.MPESA_STK_CALLBACK_URL}?user=${user}`,
            AccountReference: accountRef,
            TransactionDesc: transactionDesc
        }
        console.log("short code: ", stkData.BusinessShortCode)

        const { data } = await client.post("/mpesa/stkpush/v1/processrequest", stkData)
        console.log("data: ", data)

        if (!data || data.ResponseCode != "0") {
            throw new Error("Could not initiate stk push")
        }

        await delay(10000)
        let queryData = await mpesaExpressQuery(client, stkData.BusinessShortCode, password, timeStamp, data.CheckoutRequestID)
        console.log("query data: ", queryData)
        return queryData
    } catch (error: any) {
        console.log("Error initiating stk push ", error)
    }
}