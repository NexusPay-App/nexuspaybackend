import bcrypt from 'bcrypt';

// Import AfricasTalking module. If TypeScript types are not available, you might still need to use require or @types/africastalking if the package exists.
import AfricasTalking from 'africastalking';
import { SALT_ROUNDS } from '../config/constants';

// Initialize Africa's Talking
const africastalking = AfricasTalking({
  apiKey: '72304a965e635452ae1160a269365c30bd1ea72e6d39fba3aebd76cfa09af4a7',
  username: 'sandbox'
});

// Define the sendSMS function
export const sendSMS = async (): Promise<void> => {
  try {
    const result = await africastalking.SMS.send({
      to: '+254796448347',
      message: 'Hey AT Ninja! Wassup...',
      from: 'NEXUSPAY'
    });
    console.log(result);
  } catch (ex) {
    console.error(ex);
  }
};

export const formatMpesaNumber = (phone: string) => {
  // Remove non-numbers
  phone = phone.replace(/\D/g, '');

  // Ensure the phone number has more than 8 characters
  if (phone.length < 9) {
    throw new Error("Phone number must have at least 9 digits.");
  }

  // Check that the input contains only numbers
  if (!/^\d+$/.test(phone)) {
    throw new Error("Phone number must contain only digits.");
  }

  let phoneNumber = "254" + phone.slice(-9);
  return phoneNumber;
};


export class PasswordManager {
  static async toHash(password: string) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  static async compare(suppliedPassword: string, storedPassword: string) {
    return await bcrypt.compare(suppliedPassword, storedPassword)
  }

  static isCorrectFormat(password: string) {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return pattern.test(password);
  }
}
