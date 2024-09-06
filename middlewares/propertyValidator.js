const Joi = require('@hapi/joi');

const propertyValidator = (req, res, next) => {
  const propertyValidationProperties = Joi.object({
    name: Joi.string()
      .trim() 
      .min(3).max(100)
      .pattern(/^[a-zA-Z0-9\s]+$/) // Only allows letters, numbers, and spaces
      .required()
      .messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name should have a minimum length of 3',
        'string.max': 'Name should have a maximum length of 100',
        'string.pattern.base': 'Name can only contain letters, numbers, and spaces',
        'string.trim': 'Name cannot have leading or trailing spaces',
        'any.required': 'Name is required'
      }),
  
    location: Joi.string()
      .trim() 
      .min(3).max(100)
      .pattern(/^(?!.*,,)[a-zA-Z0-9\s,]+$/) // Allows letters, numbers, spaces, and single commas but no consecutive commas or symbols
      .required()
      .messages({
        'string.base': 'Location must be a string',
        'string.empty': 'Location cannot be empty',
        'string.min': 'Location should have a minimum length of 3',
        'string.max': 'Location should have a maximum length of 100',
        'string.pattern.base': 'Location can only contain letters, numbers, spaces, and single commas, but no consecutive commas or symbols',
        'string.trim': 'Location cannot have leading or trailing spaces',
        'any.required': 'Location is required'
      }),
  
    price: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price must be greater than or equal to 0',
        'any.required': 'Price is required'
      }),
  
    propertyType: Joi.string()
      .valid('apartment', 'house', 'condo', 'townhouse') 
      .required()
      .messages({
        'string.base': 'Property type must be a string',
        'string.empty': 'Property type cannot be empty',
        'any.only': 'Property type must be one of: apartment, house, condo, townhouse',
        'any.required': 'Property type is required'
      }),
  
    bedrooms: Joi.number()
      .min(1)
      .required()
      .messages({
        'number.base': 'Number of bedrooms must be a number',
        'number.min': 'Number of bedrooms must be at least 1',
        'any.required': 'Number of bedrooms is required'
      }),
  
    bathrooms: Joi.number()
      .min(1)
      .required()
      .messages({
        'number.base': 'Number of bathrooms must be a number',
        'number.min': 'Number of bathrooms must be at least 1',
        'any.required': 'Number of bathrooms is required'
      }),
  
    squareFeet: Joi.number()
      .min(1)
      .required()
      .messages({
        'number.base': 'Square feet must be a number',
        'number.min': 'Square feet must be at least 1',
        'any.required': 'Square feet is required'
      }),
  
    amenities: Joi.array()
      .items(Joi.string().trim())
      .messages({
        'array.base': 'Amenities must be an array',
        'string.base': 'Each amenity must be a string',
        'string.trim': 'Each amenity cannot have leading or trailing spaces'
      }),
  
    description: Joi.string()
      .trim() 
      .max(500)
      .messages({
        'string.base': 'Description must be a string',
        'string.max': 'Description should have a maximum length of 500',
        'string.trim': 'Description cannot have leading or trailing spaces'
      }),
  
    images: Joi.array()
      .items(
        Joi.object({
          pictureId: Joi.string().trim(),
          pictureUrl: Joi.string().uri().trim()
        })
      )
      .messages({
        'array.base': 'Images must be an array',
        'object.base': 'Each image must be an object',
        'string.base': 'Each picture ID and URL must be a string',
        'string.uri': 'Each picture URL must be a valid URI',
        'string.trim': 'Each picture ID and URL cannot have leading or trailing spaces'
      }),
  
    listedBy: Joi.string()
      .trim()
      .required()
      .messages({
        'string.base': 'ListedBy must be a string',
        'string.trim': 'ListedBy cannot have leading or trailing spaces',
        'any.required': 'ListedBy is required'
      }),
  
    isAvailable: Joi.boolean()
      .messages({
        'boolean.base': 'Availability status must be a boolean'
      })
  });

  const { error } = propertyValidationProperties.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  next();
};

module.exports = { propertyValidator };
