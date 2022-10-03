import connection from '../conection/conection.js';
import {categoriSchema} from '../schemas/schemas.js';
import dayjs from 'dayjs';


async function categoryList(req, res){
    try{
        const categories = await connection.query('SELECT * FROM categories;');
        res.send(categories.rows);

    }catch(err){
        res.sendStatus(500);
    }
}

async function addCategory(req, res){
    const {name} = req.body;

    const validation = categoriSchema.validate(req.body, {abortEarly: false});
    if (validation.error){
        const erros = validation.error.details
        return res.status(400).send(erros.map((value)=> value.message));
    };

    try{
        const categories = await connection.query('SELECT * FROM categories WHERE name = $1;'
        ,[name]);
        if(categories.rows.length > 0 ){
            return res.sendStatus(409);
        }
        await connection.query(`INSERT INTO categories (name) VALUES ($1);`,[name]);
        res.sendStatus(201);
    }catch(err){
        res.sendStatus(500);
    }
}

export {categoryList, addCategory};