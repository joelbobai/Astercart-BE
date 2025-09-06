import Joi from "joi";

// Validation schema for Store signup
export const storeSignupSchema = Joi.object({
  name: Joi.string().required(), // Store's name
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  userType: Joi.string().valid("Store").required(),
  storeDetails: Joi.object({
    address: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    lga: Joi.string().required(),
  }).required(),
});

// Validation schema for Customer signup
export const customerSignupSchema = Joi.object({
  name: Joi.string().required(), // Customer's name
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  userType: Joi.string().valid("Customer").required(),
});

// Validation schema for Rider signup
export const riderSignupSchema = Joi.object({
  name: Joi.string().required(), // Rider's name
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  userType: Joi.string().valid("Rider").required(),
  riderDetails: Joi.object({
    vehicleType: Joi.string().required(),
    licenseNumber: Joi.string().required(),
  }).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  userType: Joi.string().required(),
});

// ✅ Admin Signup Schema 
export const adminSignupSchema = Joi.object({
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  password: Joi.string().min(6).required()
});

export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});
