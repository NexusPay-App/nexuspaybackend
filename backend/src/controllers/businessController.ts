import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Business } from '../models/businessModel';

//take this createAccount to utils or services instead of using it from auth
import { createAccount } from '../services/auth';

const SALT_ROUNDS = 10; // Consider storing this in environment variables

export const registerBusiness = async (req: Request, res: Response) => {

  const { businessName, ownerName, location, phoneNumber, password } = req.body;

  if (!businessName || !ownerName || !location || !phoneNumber || !password) {
    return res.status(400).send({ message: "All fields are required!" });
  }

  // let business = await Business.findOne({ phoneNumber: phoneNumber });
  let business;


  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const businessSmartAccount = await createAccount();
  const { biconomySmartAccount, pk } = businessSmartAccount;
  const walletAddress = await biconomySmartAccount.getSmartAccountAddress();

  // Generate unique 5-digit code
  const uniqueCode = (Math.floor(Math.random() * 90000) + 10000).toString();

  try {
    business = new Business({
      businessName,
      ownerName,
      location,
      uniqueCode,
      phoneNumber,
      walletAddress,
      password: hashedPassword,
      privateKey: pk
    });

    await business.save();
    res.send({
      message: "Business registered successfully!",
      walletAddress: walletAddress,
      uniqueCode: uniqueCode
    });

  } catch (error) {
    console.error("Error registering business:", error);
    res.status(500).send({ message: "An error occurred while registering the business." });
  }
};

