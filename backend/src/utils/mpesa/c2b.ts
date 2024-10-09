import { mpesaClient } from "./auth";
import { MPESA_CONFIG } from "./config";


export const initiateSTKPush = async (senderPhoneNumber: string, businessShortCode: string, amount: number, accountRef: string, transactionType = 'CustomerPayBillOnline', transactionDesc = 'Lipa na mpesa online',) => {
    try {
        const client = await mpesaClient()

        const timeStamp = (new Date()).toISOString().replace(/[^0-9]/g, '').slice(0, -3)
        const password = Buffer.from(`${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passKey}${timeStamp}`).toString('base64')

        const stkData = {
            BusinessShortCode: businessShortCode,
            Password: password,
            Timestamp: timeStamp,
            TransactionType: transactionType,
            Amount: amount,
            PartyA: senderPhoneNumber,
            PartyB: MPESA_CONFIG.shortCode,
            PhoneNumber: senderPhoneNumber,
            CallBackURL: MPESA_CONFIG.callbackUrl,
            AccountReference: accountRef,
            TransactionDesc: transactionDesc
        }

        const { data } = await client.post("/mpesa/stkpush/v1/processrequest", stkData)

        if (!data || data.ResponseCode != "0") {
            throw new Error("Could not initiate stk push")
        }

    } catch (error: any) {
        console.log("Error initiating stk push ", error)
    }
}
