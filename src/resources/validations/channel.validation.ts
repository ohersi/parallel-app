import Joi, { optional } from 'joi';

// Create channel
const create = Joi.object({
    title: Joi.string().required().max(80),
    description: Joi.string().required().max(200),
});

// Update channel
const update = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
});


export default { create, update };