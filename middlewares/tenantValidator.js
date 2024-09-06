const Joi = require('@hapi/joi');


const tenantValidator = async (req, res, next) => {
    const tenantValidationProperties = Joi.object({
        firstName: Joi.string()
          .pattern(/^[A-Za-z]+$/)
          .min(2)
          .max(30)
          .trim()
          .required()
          .messages({
            'string.pattern.base': 'First name should only contain alphabets and no spaces or symbols.',
            'string.empty': 'First name is required.',
            'string.min': 'First name should have at least 2 characters.',
            'string.max': 'First name should have at most 30 characters.'
          }),
      
        lastName: Joi.string()
          .pattern(/^[A-Za-z]+$/)
          .min(2)
          .max(30)
          .trim()
          .required()
          .messages({
            'string.pattern.base': 'Last name should only contain alphabets and no spaces or symbols.',
            'string.empty': 'Last name is required.',
            'string.min': 'Last name should have at least 2 characters.',
            'string.max': 'Last name should have at most 30 characters.'
          }),
      
        email: Joi.string()
          .email()
          .pattern(new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/))
          .trim()
          .required()
          .messages({
            'string.pattern.base': 'Please provide a valid email address.',
            'string.empty': 'Email is required.'
          }),
      
        password: Joi.string()
          .pattern(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$'))
          .trim()
          .required()
          .messages({
            'string.pattern.base': 'Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
            'string.empty': 'Password is required.'
          }),
      
        phoneNumber: Joi.string()
          .pattern(new RegExp(/^[0-9]{11}$/))
          .trim()
          .required()
          .messages({
            'string.pattern.base': 'Phone number must be exactly 11 digits long',
            'string.empty': 'Phone number is required.'
          }),
      
        isVerified: Joi.boolean()
          .default(false),
      
        profilePicture: Joi.object({
          pictureId: Joi.string().optional().allow('').trim(),
          pictureUrl: Joi.string().uri().optional().allow('').trim()
        }).optional(),
      
        dateOfBirth: Joi.date()
          .less('now')
          .required()
          .messages({
            'date.less': 'Date of birth must be a valid date in the past.',
            'any.required': 'Date of birth is required.'
          }),
      
        landlord: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Landlord ID must be a valid ObjectId.',
            'string.empty': 'Landlord ID is required.'
          }),
      
        property: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Property ID must be a valid ObjectId.',
            'string.empty': 'Property ID is required.'
          }),
      });
      
      const { error } = tenantValidationProperties.validate(req.body);
        if (error) {
         return res.status(400).json({
            message: error.details[0].message,
          });
        }
      
        next();

};


module.exports = { tenantValidator };
