import { mpesaClient } from "./auth"

export const b2c = async (amount: number, receiverPhoneNumber: string) => {
    try {
        const client = await mpesaClient()

        const b2cData = {
            'InitiatorName': "testapi",
            'SecurityCredential': "eXC9pN8FTnKDmmh6utFGKJ/HWHCO2pR9aHNLjmFBETeHMXLv+7VodFURkvKxw6kf4UyvvmyvFiUGaJL0OAl6ILmF0GEnMGes/Nglk4h73pyHfEbI2P0pQ3Ub7q/qSiov8xCsqqtc5HxtXFUqM8GPZpcYdBOXzCWaIsj+5fsi6z8P5RRQbieogXnAAVjW6y5HwhklajQxv2F228QnaqQivrm1oQoI1dTAH4aE2Gw4ghRnewYcV8FkRW2nG/yvR6kTr6Va/iOK7miti+FqaJpiVtzbyiZm7aVZzIQx8ciCBvEq9WqqnQD3gpaAI6RphVa2tCpOs1xgI/DGnn87zUP9vw==",
            'CommandID': "BusinessPayment",
            'Amount': amount,
            'PartyA': "600982",
            'PartyB': receiverPhoneNumber,
            'Remarks': "test",
            'QueueTimeOutURL': "https://63c1-105-163-157-42.ngrok-free.app",
            'ResultURL': "https://63c1-105-163-157-42.ngrok-free.app",
            'Occasion': "test"
        }

        const { data } = await client.post("/mpesa/b2c/v1/paymentrequest", b2cData)

        console.log("data ", data)


        if (!data || data.ResponseCode != "0") {
            throw new Error("Could not initiate stk push")
        }

    } catch (error) {
        console.log("Error executing c2b txn ", error)
    }
}
