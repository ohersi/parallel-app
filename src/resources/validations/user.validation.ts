import Joi, { optional } from 'joi';
import passwordComplexity from 'joi-password-complexity';

const complexityOptions = {
    min: 8,
    max: 20,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  };

// Create user
const create = Joi.object({
    first_name: Joi.string().required().max(30),
    last_name: Joi.string().required().max(30),
    email: Joi.string().email().lowercase().required(),
    password: passwordComplexity(complexityOptions).required(),
    avatar: Joi.string().required(),
});

// Update user
const update = Joi.object({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    avatar: Joi.string().optional(),
});

// Login user
const login = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
});


export default { create, update, login };