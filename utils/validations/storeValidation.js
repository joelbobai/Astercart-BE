import Joi from "joi";

// Validation schema for profile update request
export const profileUpdateSchema = Joi.object({
  emailAddress: Joi.string().email(),
  businessName: Joi.string(),
  // phoneNumber: Joi.string().optional(),
  supportingEmail: Joi.string().email(),
  supportingPhone: Joi.string(),
  picture: Joi.string(),
  password: Joi.string().min(6),
  storeDetails: Joi.object({
    businessAddress: Joi.string().label("businessAddress"),
    state: Joi.string(),
    postalCode: Joi.string(),
    lga: Joi.string(),
  }),
});