import { config } from "dotenv"
import { ChainId } from "@biconomy/core-types"
import { BiconomySmartAccount, BiconomySmartAccountConfig, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { Wallet, providers } from 'ethers';
import { User } from '../models/models';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { bundler, paymaster, provider } from "../config/constants";
import AfricasTalking from 'africastalking';

const SALT_ROUNDS = 10; 

// Initialize Africa's Talking
const africastalking = AfricasTalking({
  apiKey: '5256d139ae09790bfacc4690e276fa6e0e0247299b9104d7c6c85f0f675bb83b',
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

// Function to initiate registration and send OTP
export const initiateRegisterUser = async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).send({ message: "Phone number is required!" });
  }

  let existingUser = await User.findOne({ phoneNumber: phoneNumber });
  if (existingUser) {
    return res.status(409).send({ message: "Phone number already registered!" });
  }

  const otp = generateOTP();
  console.log(otp)
  otpStore[phoneNumber] = otp;

  try {
    await africastalking.SMS.send({
      to: phoneNumber,
      message: `Your verification code is: ${otp}`,
      from: 'NEXUSPAY'
    });
    return res.send({ message: "OTP sent successfully. Please verify to complete registration." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).send({ message: "Failed to send OTP." });
  }
};


export const registerUser = async (req: Request, res: Response) => {
  const { phoneNumber, password, otp } = req.body;

  if (!phoneNumber || !password || !otp) {
    return res.status(400).send({ message: "Phone number, password, and OTP are required!" });
  }

  // Verify OTP
  if (!otpStore[phoneNumber] || otpStore[phoneNumber] !== otp) {
    return res.status(400).send({ message: "Invalid or expired OTP." });
  }

  // OTP is valid, proceed with registration
  delete otpStore[phoneNumber]; // Clear the OTP as it's no longer needed

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const userSmartAccount = await createAccount();
  const { biconomySmartAccount, pk } = userSmartAccount;
  const walletAddress = await biconomySmartAccount.getSmartAccountAddress();

  try {
    const newUser = new User({
      phoneNumber: phoneNumber,
      walletAddress: walletAddress,
      password: hashedPassword,
      privateKey: pk
    });
    await newUser.save();

    const token = jwt.sign({ phoneNumber: newUser.phoneNumber, walletAddress: newUser.walletAddress }, 'zero', { expiresIn: '1h' });
    res.send({ token, message: "Registered successfully!", walletAddress: newUser.walletAddress, phoneNumber: newUser.phoneNumber });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ message: "An error occurred while registering." });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).send({ message: "Phone number and password are required!" });
  }

  let user = await User.findOne({ phoneNumber: phoneNumber });
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).send({ message: "Invalid credentials!" });
  }

  const token = jwt.sign({ phoneNumber: user.phoneNumber, walletAddress: user.walletAddress }, 'zero', { expiresIn: '1h' });
  res.send({ token, message: "Logged in successfully!", walletAddress: user.walletAddress, phoneNumber: user.phoneNumber });
};


// export const registerUser = async (req: Request, res: Response) => {
//   const { phoneNumber, password } = req.body;

//   if (!phoneNumber || !password) {
//     return res.status(400).send({ message: "Phone number and password are required!" });
//   }

//   let existingUser = await User.findOne({ phoneNumber: phoneNumber });
//   if (existingUser) {
//     return res.status(409).send({ message: "Phone number already registered!" });
//   }

//   const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
//   const userSmartAccount = await createAccount();
//   const { biconomySmartAccount, pk } = userSmartAccount;
//   const walletAddress = await biconomySmartAccount.getSmartAccountAddress();

//   try {
//     const newUser = new User({
//       phoneNumber: phoneNumber,
//       walletAddress: walletAddress,
//       password: hashedPassword,
//       privateKey: pk
//     });
//     await newUser.save();

//     const token = jwt.sign({ phoneNumber: newUser.phoneNumber, walletAddress: newUser.walletAddress }, 'zero', { expiresIn: '1h' });
//     res.send({ token, message: "Registered successfully!", walletAddress: newUser.walletAddress, phoneNumber: newUser.phoneNumber });
//   } catch (error) {
//     console.error("Error registering user:", error);
//     res.status(500).send({ message: "An error occurred while registering." });
//   }
// };

export async function createAccount() {
 
    const newWallet = Wallet.createRandom();
    const pk = newWallet.privateKey
    const wallet = new Wallet(pk, provider);
  
    const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
      signer: wallet,
      chainId: ChainId.POLYGON_MUMBAI,
      bundler: bundler,
      paymaster: paymaster
    }
  
    let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig)
    biconomySmartAccount =  await biconomySmartAccount.init()
    
    console.log("owner: ", biconomySmartAccount.owner)
    console.log("address: ", await biconomySmartAccount.getSmartAccountAddress())
    return {biconomySmartAccount, pk};
    }

    export async function instanceAccount(prikey: string) {
      const wallet = new Wallet(prikey, provider);
  
      //smart account config
      const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: wallet,
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler,
        paymaster: paymaster
      }
    
      let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig)
      biconomySmartAccount =  await biconomySmartAccount.init()
      console.log("owner: ", biconomySmartAccount.owner)
      console.log("address: ", await biconomySmartAccount.getSmartAccountAddress())
      return biconomySmartAccount;
    }



