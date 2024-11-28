

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
  password: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true,
    unique: true
  },
  migrated: {
    type: Boolean,
    required: false,
    default: false
  }
});

export const User = mongoose.model('User', userSchema);
