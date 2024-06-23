// src/thirdwebClient.ts
import { createThirdwebClient } from "thirdweb";
import dotenv from "dotenv";

dotenv.config();

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY as string,
});

export default client;
