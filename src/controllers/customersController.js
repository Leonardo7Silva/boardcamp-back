import connection from "../conection/conection.js";
import {custumersSchema} from "../schemas/schemas.js";
import dayjs from 'dayjs';

async function customerList(req, res){
    const cpf = req.query.cpf
    
    try{
        if(cpf){
            const cpfFiltrados = await connection.query(`SELECT * FROM customers WHERE cpf LIKE $1||'%' ;`, [cpf]);
            return res.send(cpfFiltrados.rows);
        };
        const customers = await connection.query('SELECT * FROM customers;');
        res.send(customers.rows);
    }catch(err){
        res.sendStatus(500);
    }
};

async function customerFilteredList (req, res){
    const {id} = req.params;
    
    try{
        const customers = await connection.query('SELECT * FROM customers WHERE id = $1;', [id]);
        if(customers.rows<1){
            return res.sendStatus(404);
        }
        res.send(customers.rows);
    }catch(err){
        res.sendStatus(500);
    }
};

async function addCustomer(req, res){
    const {name, phone, cpf, birthday} = req.body;
    dayjs('YYYY-MM-DD', true);

    if(!dayjs(birthday).isValid()){
        return res.status(400).send("insira uma data válida");
    };

    const validation = custumersSchema.validate(req.body, {abortEarly: false});
    if (validation.error){
        const erros = validation.error.details
        return res.status(400).send(erros.map((value)=> value.message));
    };

    try{
        const cpfCustomers = await connection.query('SELECT * FROM customers WHERE cpf = $1;',[cpf]);
        if(cpfCustomers.rows.length > 0 ){
            return res.sendStatus(409);
        }

        await connection.query(`INSERT INTO customers (name, phone, cpf, birthday)
         VALUES ($1, $2, $3, $4);`
        ,[name, phone, cpf, birthday]);
        res.sendStatus(201);
    }catch(err){
        res.sendStatus(500);
    }
};

async function updateCustomer(req, res){
    const {id} = req.params;
    const {name, phone, cpf, birthday} = req.body;

    const validation = custumersSchema.validate(req.body, {abortEarly: false});
    if (validation.error){
        const erros = validation.error.details
        return res.status(400).send(erros.map((value)=> value.message));
    };

    try{
        const cpfCustomers = await connection.query('SELECT * FROM customers WHERE cpf = $1;',[cpf]);
        if(cpfCustomers.rows.length > 1 || id !== cpfCustomers.rows[0].id){
            return res.sendStatus(409);
        }
        
        await connection.query(`UPDATE customers SET 
        name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;`
        ,[name, phone, cpf, birthday, id]);
        res.sendStatus(200);
    }catch(err){
        res.sendStatus(500);
    }
};

export {customerList, customerFilteredList, addCustomer, updateCustomer};
