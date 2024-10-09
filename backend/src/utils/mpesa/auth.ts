
import axios, { AxiosInstance } from "axios";
import { MPESA_CONFIG } from "./config";

let cachedAccessToken: { accessToken: string, expiry: number } = { accessToken: '', expiry: 0 }

export const getAccessToken = async () => {
    // Check if the token is still valid
    if (cachedAccessToken.accessToken && cachedAccessToken.expiry > Date.now()) {
        return cachedAccessToken.accessToken;
    }

    const auth = 'Basic ' + Buffer.from(MPESA_CONFIG.consumerKey + ':' + MPESA_CONFIG.consumerSecret).toString('base64');
    const { data } = await axios.get(`${MPESA_CONFIG.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
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


export const mpesaClient = async (): Promise<AxiosInstance> => {
    const accessToken = await getAccessToken()

    if (!accessToken) throw new Error("Could not get access token")

    return axios.create({
        baseURL: MPESA_CONFIG.baseUrl,
        timeout: MPESA_CONFIG.requestTimeout,
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        }
    })
}