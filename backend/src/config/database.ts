
import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL!;
// const MONGO_URL = "mongodb+srv://agatenashons:nashtech9021@afpay.cnz3ecn.mongodb.net/?retryWrites=true&w=majority";

export async function connect() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Successfully connected to MongoDB using Mongoose");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
