import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
    businessName: {
      type: String,
      required: true,
      unique: true
    },
    ownerName: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    uniqueCode: {
      type: String,
      required: true,
      unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
      },
    walletAddress: {
      type: String,
      required: true
    },
    privateKey: {
      type: String,
      required: true,
      unique: true
    }
  });
  
  export const Business = mongoose.model('Business', businessSchema);
  