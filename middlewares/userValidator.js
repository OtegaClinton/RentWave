const Joi = require("@hapi/joi")


const userValidator = async (req, res, next) => {
  const userValidationProperties = Joi.object({
    firstName: Joi.string().trim().pattern(new RegExp(/^[A-Za-z]{3,30}$/)).required().messages({
      'string.empty': 'First name is required',
      'any.required': 'First name is required',
      'string.pattern.base': 'First name must be 3-30 characters long and contain only letters'
    }),
    lastName: Joi.string().trim().pattern(new RegExp(/^[A-Za-z]{3,30}$/)).required().messages({
      'string.empty': 'Last name is required',
      'any.required': 'Last name is required',
      'string.pattern.base': 'Last name must be 3-30 characters long and contain only letters'
    }),
    email: Joi.string().trim().pattern(new RegExp(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)).required().messages({
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
      'string.pattern.base': 'Email must be a valid email address'
    }),
    
    password: Joi.string().trim().pattern(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
      'string.pattern.base': 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
    }),
    confirmPassword: Joi.string().trim().valid(Joi.ref('password')).required().messages({
      'any.only': 'Confirm password must match the password',
      'string.empty': 'Confirm password is required',
      'any.required': 'Confirm password is required'
    }),
    phoneNumber: Joi.string().trim().pattern(new RegExp(/^[0-9]{11}$/)).required().messages({
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required',
      'string.pattern.base': 'Phone number must be exactly 11 digits long'
    }),
    role: Joi.string().valid('Landlord', 'Tenant', 'isAdmin', 'isSuperAdmin').default('Landlord').messages({
      'any.only': 'Role must be one of [Landlord, Tenant, isAdmin, isSuperAdmin]',
      'any.required': 'Role is required'
    }),
    isAdmin: Joi.boolean().optional(),
    isSuperAdmin: Joi.boolean().optional(),
    isVerified: Joi.boolean().optional(),
    profilePicture: Joi.object({
      pictureId: Joi.string().optional(),
      pictureUrl: Joi.string().uri().optional()
    }).optional(),
    properties: Joi.array().items(Joi.string().pattern(new RegExp(/^[0-9a-fA-F]{24}$/))).optional().messages({
      'string.pattern.base': 'Each property ID must be a valid MongoDB ObjectId'
    }),
    tenants: Joi.array().items(Joi.string().pattern(new RegExp(/^[0-9a-fA-F]{24}$/))).optional().messages({
      'string.pattern.base': 'Each tenant ID must be a valid MongoDB ObjectId'
    })
  });

  const { error } = userValidationProperties.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  next();
};

module.exports = { userValidator };
