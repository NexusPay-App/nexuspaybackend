import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  providerId: String,
  providerName: String,
  proof: {},
  verified: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Verification = mongoose.model('Verification', verificationSchema);

// module.exports = Verification;
