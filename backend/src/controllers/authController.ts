import { config } from "dotenv"
import { ChainId } from "@biconomy/core-types"
import { BiconomySmartAccount, BiconomySmartAccountConfig, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { Wallet, providers, ethers } from 'ethers';
import { User } from '../models/models';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { bundler, paymaster, provider } from "../config/constants";
import AfricasTalking from 'africastalking';
import { privateKeyAccount, smartWallet } from "thirdweb/wallets";
import dotenv from "dotenv";
import { getContract, sendTransaction } from "thirdweb";
import {  arbitrumSepolia } from "thirdweb/chains";
import { defineChain } from "thirdweb";
import client from "../config/thirdwebClient";
import { FuseSDK } from '@fuseio/fusebox-web-sdk';


dotenv.config();
const SALT_ROUNDS = 10; 
const celo = defineChain(42220);


const myChain = defineChain({
  id: 42220,
  rpc: "wss://forno.celo.org/ws"
});

// console.log(`chain is ${celo}`)

// Log the entire object as a JSON string
console.log(`chain is ${JSON.stringify(celo, null, 2)}`);

// Log specific properties if you want to be more specific
console.log(`chain name is ${celo.name}`);
console.log(`chain arbitrum ${JSON.stringify(arbitrumSepolia, null, 2)}`);

// Initialize Africa's Talking
const africastalking = AfricasTalking({
  apiKey: '8fc37bdf0cd1f8df152e422c38919aeed78c019b64460b9e5c561d36bac405fd',
  username: 'NEXUSPAY'
});
// Temporary store for OTPs
const otpStore: Record<string, string> = {};

// Helper function to generate OTP
const generateOTP = (): string => {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
};

export const initiateRegisterUser = async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).send({ message: "Phone number is required!" });
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ phoneNumber: phoneNumber });
  } catch (error) {
    return handleError(error, res, "Failed to check existing user");
  }

  if (existingUser) {
    return res.status(409).send({ message: "Phone number already registered!" });
  }

  const otp = generateOTP();
  otpStore[phoneNumber] = otp;

  try {
    await africastalking.SMS.send({
      to: phoneNumber,
      message: `Your verification code is: ${otp}`,
      from: 'NEXUSPAY'
    });
    return res.send({ message: "OTP sent successfully. Please verify to complete registration." });
  } catch (error) {
    return handleError(error, res, "Failed to send OTP", 500);
  }
};


export const registerUser = async (req: Request, res: Response) => {
  const { phoneNumber, password, otp } = req.body;

  // if (!phoneNumber || !password || !otp) {
  //   return res.status(400).send({ message: "Phone number, password, and OTP are required!" });
  // }

  // if (!otpStore[phoneNumber] || otpStore[phoneNumber] !== otp) {
  //   return res.status(400).send({ message: "Invalid or expired OTP." });
  // }

  // delete otpStore[phoneNumber]; // Clear the OTP as it's no longer needed
  let newUser, hashedPassword, userSmartAccount;

  try {
    hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    userSmartAccount = await createAccount();
  } catch (error) {
    return handleError(error, res, "Error during account creation or password hashing");
  }

  const { biconomySmartAccount, pk, celowallet, fuseWallet } = userSmartAccount;
  const walletAddress = await biconomySmartAccount.getSmartAccountAddress();

  try {
    newUser = new User({
      phoneNumber: phoneNumber,
      walletAddress: walletAddress,
      celoWalletAddress: celowallet,
      fuseWalletAddress: fuseWallet,
      password: hashedPassword,
      privateKey: pk
    });
    await newUser.save();
  } catch (error) {
    return handleError(error, res, "Error registering user");
  }

  const token = jwt.sign({ phoneNumber: newUser.phoneNumber, walletAddress: newUser.walletAddress, celoWallet: newUser.celoWalletAddress }, 'zero', { expiresIn: '1h' });
  res.send({ token, message: "Registered successfully!", arbitrumWallet: newUser.walletAddress, celoWallet: newUser.celoWalletAddress, fuseWallet: newUser.fuseWalletAddress, phoneNumber: newUser.phoneNumber });
};


export const loginUser = async (req: Request, res: Response) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).send({ message: "Phone number and password are required!" });
  }
console.log(`${phoneNumber} and passwod is ${password}`)
  let user;
  try {
    user = await User.findOne({ phoneNumber: phoneNumber });
  } catch (error) {
    return handleError(error, res, "Failed to retrieve user information");
  }

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  let isPasswordValid;
  try {
    isPasswordValid = await bcrypt.compare(password, user.password);
  } catch (error) {
    return handleError(error, res, "Error checking password validity");
  }

  if (!isPasswordValid) {
    return res.status(401).send({ message: "Invalid credentials!" });
  }

  const token = jwt.sign({ phoneNumber: user.phoneNumber, walletAddress: user.walletAddress }, 'zero', { expiresIn: '1h' });
  res.send({ token, message: "Logged in successfully!", arbitrumWallet: user.walletAddress, celoWallet: user.celoWalletAddress, phoneNumber: user.phoneNumber });
};


export const requestPasswordReset = async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).send({ message: "Phone number is required!" });
  }

  const user = await User.findOne({ phoneNumber: phoneNumber });
  if (!user) {
    return res.status(404).send({ message: "User not found." });
  }

  const otp = generateOTP();
  otpStore[phoneNumber] = otp;

  try {
    await africastalking.SMS.send({
      to: phoneNumber,
      message: `Your password reset code is: ${otp}`,
      from: 'NEXUSPAY'
    });
    return res.send({ message: "OTP sent successfully. Please use it to reset your password." });
  } catch (error) {
    return handleError(error, res, "Failed to send password reset OTP", 500);
  }
};


export const resetPassword = async (req: Request, res: Response) => {
  const { phoneNumber, otp, newPassword } = req.body;

  if (!phoneNumber || !otp || !newPassword) {
    return res.status(400).send({ message: "Phone number, OTP, and new password are required!" });
  }

  if (otpStore[phoneNumber] !== otp) {
    return res.status(400).send({ message: "Invalid or expired OTP." });
  }

  delete otpStore[phoneNumber];  // Clear the OTP as it's no longer needed

  try {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.updateOne({ phoneNumber: phoneNumber }, { password: hashedPassword });
    return res.send({ message: "Password reset successfully. You can now login with your new password." });
  } catch (error) {
    return handleError(error, res, "Failed to reset password", 500);
  }
};



export async function createAccount() {
 
    const newWallet = Wallet.createRandom();
    const pk = newWallet.privateKey
    const wallet = new Wallet(pk, provider);
  
    const celowallet = await createAccountCelo(pk)
    const fuseWallet = await createAccountFuse(pk)
    const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
      signer: wallet,
      chainId: ChainId.ARBITRUM_ONE_MAINNET,
      bundler: bundler,
      paymaster: paymaster
    }
  
    let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig)
    biconomySmartAccount =  await biconomySmartAccount.init()
    
    // console.log("owner: ", biconomySmartAccount.owner)
    console.log("arbitrum: ", await biconomySmartAccount.getSmartAccountAddress())
    return {biconomySmartAccount, celowallet, fuseWallet, pk};
    }

    export async function instanceAccount(prikey: string) {
      const wallet = new Wallet(prikey, provider);
  
      //smart account config
      const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: wallet,
        chainId: ChainId.ARBITRUM_ONE_MAINNET,
        bundler: bundler,
        paymaster: paymaster
      }
    
      let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig)
      biconomySmartAccount =  await biconomySmartAccount.init()
      console.log("owner: ", biconomySmartAccount.owner)
      console.log("address: ", await biconomySmartAccount.getSmartAccountAddress())
      return biconomySmartAccount;
    }

    export async function createAccountCelo(privatekey: String) {
      // Create a new EOA
      const personalAccount = privateKeyAccount({
        client,
        privateKey: privatekey as string,
      });
    
      // console.log("Personal account address:", personalAccount.address);
    
      // Configure the smart wallet
      const wallet = smartWallet({
        chain: celo,
        sponsorGas: false,
      });
    
      // Connect the smart wallet
      const smartAccount = await wallet.connect({
        client,
        personalAccount,
      });
    
      console.log("celo:", smartAccount.address);
    
      return smartAccount.address;
    }


    export async function createAccountFuse(privatekey: String) {

      const apiKey = process.env.FUSE_PUBLIC_API_KEY as string;
const credentials = new ethers.Wallet(privatekey as string);
const fuse = await FuseSDK.init(apiKey, credentials);

// Create Wallet
const smartContractAddress = fuse.wallet.getSender();
console.log(`Fuse Address is ${smartContractAddress}`);
return smartContractAddress
    }


// Utility function to handle errors
const handleError = (error: any, res: Response, message: string, statusCode: number = 500) => {
  console.error(message, error);
  return res.status(statusCode).send({ error: message, details: error.message });
};
