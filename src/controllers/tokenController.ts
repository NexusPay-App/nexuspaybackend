
import { Request, Response } from 'express';
import { User } from '../models/models';
import { Business } from '../models/businessModel';
import { ethers } from 'ethers';
import { africastalking } from '../services/auth';
import { sendToken } from '../services/token';
import { Chain } from '../types/token';
import { getAllTokenTransferEvents } from '../services/token';

export const send = async (req: Request, res: Response) => {
    const { recipientIdentifier, amount, senderAddress, chain } = req.body;
    if (!recipientIdentifier || !amount || !senderAddress || !chain) {
        return res.status(400).send({ message: "Required parameters are missing!" });
    }
    console.log(`${amount}, ${senderAddress}, ${recipientIdentifier}, ${chain}`)
    let recipientAddress = recipientIdentifier;
    let recipientPhone = '';
    if (!ethers.utils.isAddress(recipientIdentifier)) {
        const user = await User.findOne({ phoneNumber: recipientIdentifier });
        if (!user) {
            return res.status(404).send({ message: "Recipient not found!" });
        }
        if (chain === 'celo' || chain == "arbitrum") {
            recipientAddress = user.walletAddress;
        } else {
            return res.status(400).send({ message: "Unsupported chain!" });
        }
        recipientPhone = user.phoneNumber;
    }

    let sender

    try {
        if (chain === 'celo' || chain == 'arbitrum') {
            sender = await User.findOne({ walletAddress: senderAddress });
        }
        else {
            return res.status(400).send({ message: "Unsupported chain!" });
        }
        console.log("sender: ", sender)
        await sendToken(recipientAddress, amount, chain, sender?.privateKey as string);
        // Retrieve the sender's phone number from the database
        const senderPhone = sender ? sender.phoneNumber : '';

        // Generate the current date and time in Kenyan timezone
        const formatter = new Intl.DateTimeFormat('en-KE', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
            timeZone: 'Africa/Nairobi'
        });
        const currentDateTime = formatter.format(new Date());

        // Generate a pseudo-unique transaction code
        const transactionCode = Math.random().toString(36).substring(2, 12);

        // Format the amount for display
        const amountDisplay = `${amount} USDC`;

        // Compose SMS messages following the requested structure
        const recipientMessage = `${transactionCode} Confirmed. ${amountDisplay} Received from ${senderPhone} on ${currentDateTime}.`;
        const senderMessage = `${transactionCode} Confirmed. ${amountDisplay} sent to ${recipientPhone} on ${currentDateTime}.`;

        // Send SMS messages to both sender and recipient
        if (senderPhone) {
            await africastalking.SMS.send({
                to: senderPhone,
                message: senderMessage,
                from: 'NEXUSPAY'
            });
            console.log("sending to sender phone: ", senderPhone)
        }

        if (recipientPhone) {
            await africastalking.SMS.send({
                to: recipientPhone,
                message: recipientMessage,
                from: 'NEXUSPAY'
            });
        }

        res.send({ message: 'Token sent successfully and SMS notifications delivered!' });
    } catch (error) {
        console.error("Error in send API:", error);
        res.status(500).send({ message: 'Failed to send token or SMS notifications.', error: error });
    }
};



export const pay = async (req: Request, res: Response) => {
    const { senderAddress, businessUniqueCode, amount, confirm, chainName } = req.body;
    if (!businessUniqueCode || !amount || !senderAddress) {
        return res.status(400).send({ message: "Required parameters are missing!" });
    }

    let sender = await User.findOne({ walletAddress: senderAddress });
    const business = await Business.findOne({ uniqueCode: businessUniqueCode });
    if (!business) {
        return res.status(404).send({ message: "Business not found!" });
    }

    if (!confirm) {
        return res.status(200).send({
            message: "Please confirm the payment to the business.",
            businessName: business.businessName
        });
    }

    try {
        await sendToken(business.walletAddress, amount, chainName, sender?.privateKey as string)
        res.send({ message: 'Token sent successfully to the business!', paid: true });
    } catch (error) {
        console.error("Error in pay API:", error);
        res.status(500).send({ message: 'Failed to send token.', error: error });
    }
};


export const tokenTransferEvents = async (req: Request, res: Response) => {
    const { address, chain } = req.query;

    if (!address) {
        return res.status(400).send('Address is required as a query parameter.');
    }

    if (!chain) {
        return res.status(400).send('Chain is required as a query parameter.');
    }

    if (!['arbitrum', 'celo'].includes(chain as string)) {
        return res.status(400).send('Invalid chain parameter. Supported chains are arbitrum and celo.');
    }

    try {
        const events = await getAllTokenTransferEvents(chain as Chain, address as string);
        res.json(events);
    } catch (error) {
        console.error('Error fetching token transfer events:', error);
        res.status(500).send({ message: 'Internal server error', error: error });
    }
};