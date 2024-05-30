

// import express from 'express';
// import { loginUser, registerUser, initiateRegisterUser } from '../controllers/authController';

// const router = express.Router();

// router.post('/login', loginUser);
// router.post('/register/initiate', initiateRegisterUser); // Step 1: Send OTP
// router.post('/register', registerUser); // Step 2: Verify OTP and complete registration

// export default router;


import express from 'express';
import { requestPasswordReset, resetPassword, loginUser, registerUser, initiateRegisterUser, initiateRegisterUserSandbox, registerUserSandbox} from '../controllers/authController';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register/initiate', initiateRegisterUser);
router.post('/register/initiate-sandbox', initiateRegisterUserSandbox);
router.post('/register', registerUser);
router.post('/register-sandbox', registerUserSandbox);

router.post('/password-reset/request', requestPasswordReset);
router.post('/password-reset', resetPassword);

export default router;
