import Joi, { optional } from 'joi';

// Create block
const create = Joi.object({
    title: Joi.string().required().max(80),
    description: Joi.string().required().max(200),
    source_url: Joi.string().required().max(200),
    image_url: Joi.string().required().max(200),
});

// Update block
const update = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    source_url: Joi.string().optional(),
    image_url: Joi.string().optional(),
});


export default { create, update };