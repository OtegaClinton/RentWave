const Joi = require('@hapi/joi');

// Password Validator
const passwordValidator = (req, res, next) => {
  const schema = Joi.object({
    newPassword: Joi.string()
      .min(8)
      .max(30)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        "string.min": "Password should have a minimum length of 8 characters",
        "string.max": "Password should not exceed 30 characters",
        "string.pattern.base": "Password should include at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "New password is required"
      }),
    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        "any.only": "New password and confirmation do not match",
        "any.required": "Password confirmation is required"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

// Email Validator
const emailValidator = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

module.exports = {
  passwordValidator,
  emailValidator
};
