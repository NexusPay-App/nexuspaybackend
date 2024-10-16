import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Business } from '../models/businessModel';
import { createAccount, SALT_ROUNDS } from '../services/auth';

export const registerBusiness = async (req: Request, res: Response) => {

  const { businessName, ownerName, location, phoneNumber, password, chainName } = req.body;

  if (!businessName || !ownerName || !location || !phoneNumber || !password) {
    return res.status(400).send({ message: "All fields are required!" });
  }

  let business;


  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const { pk, walletAddress } = await createAccount(chainName);
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

