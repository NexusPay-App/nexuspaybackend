

// export const User = mongoose.model('User', userSchema);
import mongoose from 'mongoose';

const userSchemaSandbox = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: false
  },
  walletAddress: {
    type: String,
    required: true,
    unique: false
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

export const UserSandbox = mongoose.model('UserSandbox', userSchemaSandbox);
