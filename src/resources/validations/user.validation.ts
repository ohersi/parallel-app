import Joi from 'joi';

//TODO: Set up requirements

// Create user
const create = Joi.object({

    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(7).required(),
    profileimg: Joi.string().required(),
});

// Update user
const update = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    profileimg: Joi.string().required(),
});

export default { create, update };