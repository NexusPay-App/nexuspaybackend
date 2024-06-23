

// export const User = mongoose.model('User', userSchema);
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  celoWalletAddress: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true,
    unique: true
  }
});

export const User = mongoose.model('User', userSchema);
