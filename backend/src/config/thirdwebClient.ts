// src/thirdwebClient.ts
import { createThirdwebClient } from "thirdweb";
import env from "./env";

const client = createThirdwebClient({
  secretKey: env.THIRDWEB_SECRET_KEY as string,
});

export default client;
