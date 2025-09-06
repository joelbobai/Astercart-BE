```markdown
# API Endpoints Documentation

## Overview
This document provides an overview of the available API endpoints for the authentication service of Astercart.

## Base URL
```
[Base URL of your API, e.g., https://astercart-server.onrender.com/api]
```

## Endpoints

### 1. User Signup

#### Store Signup
- **Description**: Register a new store user.
- **Method**: `POST`
- **URL**: `/api/auth/signup/store`

#### Request Body
```json
{
    "email": "store@example.com",
    "password": "yourpassword",
    "userType": "store",
    "additionalField1": "value1",
    "additionalField2": "value2"
}
```

#### Response
- **Status Code**: `201`
- **Response Body**:
```json
{
    "message": "User registered successfully"
}
```

#### Error Response
- **Status Code**: `400`
- **Response Body**:
```json
{
    "message": "Email already exists"
}
```

---

#### Customer Signup
- **Description**: Register a new customer user.
- **Method**: `POST`
- **URL**: `/api/auth/signup/customer`

#### Request Body
```json
{
    "email": "customer@example.com",
    "password": "yourpassword",
    "userType": "customer",
    "additionalField1": "value1",
    "additionalField2": "value2"
}
```

#### Response
- **Status Code**: `201`
- **Response Body**:
```json
{
    "message": "User registered successfully"
}
```

#### Error Response
- **Status Code**: `400`
- **Response Body**:
```json
{
    "message": "Email already exists"
}
```

---

#### Rider Signup
- **Description**: Register a new rider user.
- **Method**: `POST`
- **URL**: `/api/auth/signup/rider`

#### Request Body
```json
{
    "email": "rider@example.com",
    "password": "yourpassword",
    "userType": "rider",
    "additionalField1": "value1",
    "additionalField2": "value2"
}
```

#### Response
- **Status Code**: `201`
- **Response Body**:
```json
{
    "message": "User registered successfully"
}
```

#### Error Response
- **Status Code**: `400`
- **Response Body**:
```json
{
    "message": "Email already exists"
}
```

---

### 2. User Login
- **Description**: Authenticate a user and return a JWT token.
- **Method**: `POST`
- **URL**: `/api/auth/login`

#### Request Body
```json
{
    "email": "user@example.com",
    "password": "yourpassword"
}
```

#### Response
- **Status Code**: `200`
- **Response Body**:
```json
{
    "message": "Login successful",
    "token": "your_jwt_token_here"
}
```

#### Error Response
- **Status Code**: `400`
- **Response Body**:
```json
{
    "message": "Invalid credentials"
}
```

---

## Error Handling
- **Common Error Codes**:
    - `400`: Bad Request (e.g., invalid input, email already exists)
    - `500`: Internal Server Error (e.g., server issues)

## Authentication
- This API uses JWT (JSON Web Tokens) for authentication. Upon successful login, a token will be returned, which should be included in the `Authorization` header for protected routes.

## Contact
For any questions or issues, please contact [Your Contact Information].
```