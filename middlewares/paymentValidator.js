const Joi = require('@hapi/joi');


const paymentValidator = async (req,res,next) =>{

    const paymentValidationProperties = Joi.object({
        amount: Joi.number()
          .positive() 
          .required()
          .messages({
            'number.base': 'Amount must be a number',
            'number.positive': 'Amount must be a positive number',
            'any.required': 'Amount is required'
          }),
      
        paymentDate: Joi.date()
          .default(Date.now) // Default to the current date
          .messages({
            'date.base': 'Payment date must be a valid date'
          }),
      
        dueDate: Joi.date()
          .required()
          .greater(Joi.ref('paymentDate')) // Ensure due date is after payment date
          .messages({
            'date.base': 'Due date must be a valid date',
            'date.greater': 'Due date must be after the payment date',
            'any.required': 'Due date is required'
          }),
      
        status: Joi.string()
          .valid('Paid', 'Unpaid')
          .default('Unpaid')
          .messages({
            'string.base': 'Status must be a string',
            'string.valid': 'Status must be either "Paid" or "Unpaid"',
            'any.default': 'Status defaults to "Unpaid"'
          }),
      
        tenant: Joi.string()
          .required()
          .messages({
            'string.base': 'Tenant must be a string',
            'any.required': 'Tenant is required'
          }),
      
        landlord: Joi.string()
          .required()
          .messages({
            'string.base': 'Landlord must be a string',
            'any.required': 'Landlord is required'
          }),
      
        property: Joi.string()
          .required()
          .messages({
            'string.base': 'Property must be a string',
            'any.required': 'Property is required'
          }),
      
        paymentMethod: Joi.string()
          .valid('Bank Transfer', 'Credit Card', 'Cash', 'Other')
          .default('Bank Transfer')
          .messages({
            'string.base': 'Payment method must be a string',
            'string.valid': 'Payment method must be one of: Bank Transfer, Credit Card, Cash, Other',
            'any.default': 'Payment method defaults to "Bank Transfer"'
          }),
      
        transactionId: Joi.string()
          .allow('') // Allow an empty string if not provided
          .messages({
            'string.base': 'Transaction ID must be a string'
          }),
      
        notes: Joi.string()
          .allow('') // Allow an empty string if not provided
          .messages({
            'string.base': 'Notes must be a string'
          })
      });
      
      
        const { error } = paymentValidationProperties.validate(req.body);
            if (error) {
             return res.status(400).json({
                message: error.details[0].message,
              });
            }
            
            next();
            
      
};


module.exports = {paymentValidator};
