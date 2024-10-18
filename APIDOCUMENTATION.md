## NEXUSPAY API DOCUMENTATION

## 1. Authentication API Documentation

This document provides a comprehensive guide to the authentication APIs available for integrating user registration, login, and account management functionalities. It includes details on API endpoints, required parameters, expected responses, and error handling.

### Base URL

All URLs referenced in the documentation have the following base:
```
https://afpaybackend.vercel.app/api
```

### Error Handling

Errors are returned in the following format, providing clear messages and details for debugging:
```json
{
  "error": "Description of the error",
  "details": "Detailed error message if available"
}
```
Clients should handle these errors gracefully and provide appropriate user feedback.

### Endpoints

#### 1. Initiate User Registration

This endpoint sends an OTP (One Time Password) to the user's phone number as part of the registration process.

- **URL**
  ```
  POST /register/initiate
  ```

- **Data Params**
  ```json
  {
    "phoneNumber": "user_phone_number"
  }
  ```

- **Success Response**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "message": "OTP sent successfully. Please verify to complete registration."
    }
  ```

- **Error Response**
  - **Code:** 400 BAD REQUEST
  - **Content:** `{ "message": "Phone number is required!" }`
  - **Code:** 409 CONFLICT
  - **Content:** `{ "message": "Phone number already registered!" }`
  - **Code:** 500 INTERNAL SERVER ERROR
  - **Content:** `{ "error": "Failed to send OTP", "details": "Error message" }`

#### 2. Complete User Registration

This endpoint verifies the OTP and completes the user's registration, creating an account and returning an authentication token.

- **URL**
  ```
  POST /register
  ```

- **Data Params**
  ```json
  {
    "phoneNumber": "user_phone_number",
    "password": "user_password",
    "otp": "received_otp",
    "chainName": "celo"
  }
  ```

- **Success Response**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "token": "authentication_token",
      "message": "Registered successfully!",
      "walletAddress": "user_wallet_address",
      "phoneNumber": "user_phone_number"
    }
  ```

- **Error Response**
  - **Code:** 400 BAD REQUEST
  - **Content:** `{ "message": "Invalid or expired OTP." }`
  - **Code:** 500 INTERNAL SERVER ERROR
  - **Content:** `{ "error": "Error registering user", "details": "Error message" }`

#### 3. User Login

This endpoint authenticates a user by their phone number and password, returning an authentication token if successful.

- **URL**
  ```
  POST /login
  ```

- **Data Params**
  ```json
  {
    "phoneNumber": "user_phone_number",
    "password": "user_password"
  }
  ```

- **Success Response**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "token": "authentication_token",
      "message": "Logged in successfully!",
      "walletAddress": "user_wallet_address",
      "phoneNumber": "user_phone_number"
    }
  ```

- **Error Response**
  - **Code:** 400 BAD REQUEST
  - **Content:** `{ "message": "Phone number and password are required!" }`
  - **Code:** 401 UNAUTHORIZED
  - **Content:** `{ "message": "Invalid credentials!" }`
  - **Code:** 404 NOT FOUND
  - **Content:** `{ "message": "User not found" }`
  - **Code:** 500 INTERNAL SERVER ERROR
  - **Content:** `{ "error": "Failed to retrieve user information", "details": "Error message" }`


### 4. Request Password Reset

This endpoint is used to initiate a password reset process. It verifies the user's phone number, generates an OTP, and sends it to the registered phone number.

- **URL**
  ```
  POST /password-reset/request
  ```

- **Data Params**
  ```json
  {
    "phoneNumber": "user_phone_number"
  }
  ```

- **Success Response**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "message": "OTP sent successfully. Please use it to reset your password."
    }
  ```

- **Error Response**
  - **Code:** 400 BAD REQUEST
  - **Content:** `{ "message": "Phone number is required!" }`
  - **Code:** 404 NOT FOUND
  - **Content:** `{ "message": "User not found." }`
  - **Code:** 500 INTERNAL SERVER ERROR
  - **Content:** `{ "error": "Failed to send password reset OTP", "details": "Error message" }`

### 5. Reset Password

After receiving the OTP, this endpoint allows the user to reset their password by providing a new password along with the OTP received via SMS.

- **URL**
  ```
  POST /password-reset
  ```

- **Data Params**
  ```json
  {
    "phoneNumber": "user_phone_number",
    "otp": "received_otp",
    "newPassword": "new_password"
  }
  ```

- **Success Response**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "message": "Password reset successfully. You can now login with your new password."
    }
  ```

- **Error Response**
  - **Code:** 400 BAD REQUEST
  - **Content:** `{ "message": "Phone number, OTP, and new password are required!" }`
  - **Code:** 400 BAD REQUEST
  - **Content:** `{ "message": "Invalid or expired OTP." }`
  - **Code:** 500 INTERNAL SERVER ERROR
  - **Content:** `{ "error": "Failed to reset password", "details": "Error message" }`



## 2. Token Transaction API Documentation

This document provides detailed information on the API endpoints related to token transactions. It includes endpoints for sending tokens, making payments, and retrieving token transfer events. This guide will assist the frontend developer in integrating these functionalities effectively.

### Base URL

All API requests are made to:
```
https://afpaybackend.vercel.app/api
```

### Common Error Responses

Here are the typical error structures to expect and handle:

```json
{
  "message": "Description of the error",
  "error": "Detailed error message if available"
}
```

### Endpoints

#### 1. Send Tokens

Allows users to send tokens to another user or a known recipient address.

- **URL**
  ```
  POST /sendToken
  ```

- **Data Params**
  ```json
  {
    "tokenAddress": "0x...",
    "recipientIdentifier": "user_phone_number_or_ethereum_address",
    "amount": "number_of_tokens",
    "senderAddress": "0x..."
  }
  ```

- **Success Response**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "message": "Token sent successfully!"
    }
  ```

- **Error Response**
  - **Code:** 400 BAD REQUEST
  - **Content:** `{ "message": "Required parameters are missing!" }`
  - **Code:** 404 NOT FOUND
  - **Content:** `{ "message": "Recipient not found!" }`
  - **Code:** 500 INTERNAL SERVER ERROR
  - **Content:** `{ "message": "Failed to send token.", "error": "Error detail" }`

#### 2. Make Payment

Enables users to make payments to registered businesses using tokens.

- **URL**
  ```
  POST /pay
  ```

- **Data Params**
  ```json
  {
    "tokenAddress": "0x...",
    "senderAddress": "0x...",
    "businessUniqueCode": "business_code",
    "amount": "number_of_tokens",
    "confirm": "boolean"
  }
  ```

- **Intermediate Confirmation Response**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "message": "Please confirm the payment to the business.",
      "businessName": "Business Name"
    }
  ```

- **Success Response**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "message": "Token sent successfully to the business!",
      "paid": true
    }
  ```

- **Error Response**
  - **Code:** 400 BAD REQUEST
  - **Content:** `{ "message": "Required parameters are missing!" }`
  - **Code:** 404 NOT FOUND
  - **Content:** `{ "message": "Business not found!" }`
  - **Code:** 500 INTERNAL SERVER ERROR
  - **Content:** `{ "message": "Failed to send token.", "error": "Error detail" }`

#### 3. Token Transfer Events

Retrieves the token transfer events for a specific address.

- **URL**
  ```
  GET /token-transfer-events
  ```

- **Query Parameters**
  - **Required:** `address=ethereum_address`

- **Success Response**
  - **Code:** 200
  - **Content:**
    ```json
    [
      {
        "blockNumber": "123456",
        "timeStamp": "timestamp",
        "hash": "0x...",
        "from": "0x...",
        "to": "0x...",
        "value": "number_of_tokens",
        "tokenName": "Token Name",
        "tokenSymbol": "TKN",
        ...
      }
    ]
  ```

- **Error Response**
  - **Code:** 400 BAD REQUEST
  - **Content:** `{ "message": "Address is required as a query parameter." }`
  - **Code:** 500 INTERNAL SERVER ERROR
  - **Content:** `{ "message": "Internal server error", "error": "Error detail" }`



