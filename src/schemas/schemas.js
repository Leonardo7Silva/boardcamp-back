import joi from "joi";

const gameSchema = joi.object({
    name: joi.string().empty(" ").min(2).required(),
    image: joi.string().empty(" ").min(2).required(),
    stockTotal: joi.number().min(1).empty(" ").min(2).required(),
    categoryId: joi.number().empty(" ").min(1).required(),
    pricePerDay: joi.number().min(1).empty(" ").min(2).required(),
});

const custumersSchema = joi.object({
    name: joi.string().empty(" ").min(2).required(),
    phone: joi.string().pattern(/^[0-9]+$/).empty(" ").min(10).max(11).required(),
    cpf: joi.string().pattern(/^[0-9]+$/).empty(" ").min(11).required(),
    birthday: joi.string().empty(" ").min(10).required()
});

const categoriSchema = joi.object({
    name: joi.string().empty(" ").min(2).required()
});

export {gameSchema, custumersSchema, categoriSchema };