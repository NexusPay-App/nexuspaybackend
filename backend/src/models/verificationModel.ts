import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  providerId: String,
  providerName: String,
  phoneNumber: String,  // Adding phoneNumber field
  proof: {},
  verified: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Verification = mongoose.model('Verification', verificationSchema);
