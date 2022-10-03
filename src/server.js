import express from "express";
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import joi from 'joi';
import dayjs from "dayjs"

dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());

const {Pool} = pg;

const connection = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const categoriSchema = joi.object({
    name: joi.string().empty(" ").min(2).required()
});

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


//CATEGORIES

server.get("/categories", async (req, res) =>{
    try{
        const categories = await connection.query('SELECT * FROM categories;');
        res.send(categories.rows);
    }catch(err){
        res.sendStatus(500);
    }
});

server.post("/categories", async (req, res) =>{
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
});

//GAMES

server.get("/games", async (req, res)=> {
    const name = req.query.name
    
    try{
        if(name){
            const gamesFiltrados = await connection.query(`SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id 
            WHERE games.name LIKE '${name}%';`);
            return res.send(gamesFiltrados.rows);
        };
        const games = await connection.query(
            'SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id ;'
            );
        res.send(games.rows);
    }catch(err){
        console.log(err)
        res.sendStatus(500);
    }
});

server.post("/games", async (req, res) =>{
    const {name, image, stockTotal, categoryId, pricePerDay} = req.body;

    const validation = gameSchema.validate(req.body, {abortEarly: false});
    if (validation.error){
        const erros = validation.error.details
        return res.status(400).send(erros.map((value)=> value.message));
    };

    try{
        const gameName = await connection.query('SELECT * FROM games WHERE name = $1;',[name]);
        if(gameName.rows.length > 0 ){
            return res.sendStatus(409);
        }

        const thereCategory = await connection.query('SELECT * FROM categories WHERE id = $1;'
        ,[categoryId]);
        if(thereCategory.rows.length > 0 ){
            return res.sendStatus(400);
        };

        await connection.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay")
         VALUES ($1, $2, $3, $4, $5);`
        ,[name, image, stockTotal, categoryId, pricePerDay]);
        res.sendStatus(201);
    }catch(err){
        console.log(err)
        res.sendStatus(500);
    }
});

//COSTUMERS

server.get("/customers", async (req, res)=> {
    const cpf = req.query.cpf
    
    try{
        if(cpf){
            const cpfFiltrados = await connection.query(`SELECT * FROM customers 
            WHERE cpf LIKE '${cpf}%';`);
            return res.send(cpfFiltrados.rows);
        };
        const customers = await connection.query('SELECT * FROM customers;');
        res.send(customers.rows);
    }catch(err){
        res.sendStatus(500);
    }
});

server.get("/customers/:id", async (req, res)=> {
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
});

server.post("/customers", async (req, res) =>{
    const {name, phone, cpf, birthday} = req.body;

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
        console.log(err)
        res.sendStatus(500);
    }
});

server.put("/customers/:id", async (req, res) =>{
    const {id} = req.params;
    const {name, phone, cpf, birthday} = req.body;

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
        
        await connection.query(`UPDATE customers SET 
        name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;`
        ,[name, phone, cpf, birthday, id]);
        res.sendStatus(200);
    }catch(err){
        console.log(err)
        res.sendStatus(500);
    }
});

// RENTALS

server.get("/rentals", async (req, res)=> {
    const customerId = req.query.customerId;
    const gameId = req.query.gameId;

    
    try{
        let base = [];
        if(!gameId && !customerId){
            const rentals = await connection.query(`SELECT * FROM rentals;`);
            base = rentals.rows;
        };

        if(customerId){
            const customersFilter = await connection.query(`SELECT * FROM rentals 
            WHERE "customerId" LIKE '${customerId}%';`);
            base = customersFilter.rows;
        };

        if(gameId){
            const gamesFilter = await connection.query(`SELECT * FROM rentals 
            WHERE "gameId" LIKE '${gameId}%';`);
            base = gamesFilter.rows;
        };

        const games = await connection.query(`SELECT * FROM games;`);
        const customers = await connection.query(`SELECT * FROM customers;`);
        
        const result = base.map(value => value = {
            ...value, 
            customer: customers.rows.find( v => v.id === value.customerId), 
            game: games.rows.find( k => k.id === value.gameId)}
        );
        
        res.send(result);

    }catch(err){
        console.log(err)
        res.sendStatus(500);
    }
});

server.post("/rentals", async (req, res) =>{
    const {customerId, gameId, daysRented} = req.body;
    if(daysRented <= 0){
        res.sendStatus(400)
    }
    const today = dayjs().format('YYYY-MM-DD');


    try{

        const customer = await connection.query('SELECT * FROM customers WHERE id = $1;',[customerId]);
        if(customer.rows.length === 0 ){
            return res.sendStatus(400);
        }
        const game = await connection.query('SELECT * FROM games WHERE id = $1;',[gameId]);
        if(game.rows.length === 0 ){
            return res.sendStatus(400);
        }
        const qtdGamesRented = await connection.query('SELECT * FROM rentals WHERE "gameId" = $1;',[gameId]);

        const qtd = qtdGamesRented.rows.filter(value => value.returnDate === null);

        if(game.rows[0].stockTotal < qtd.length){
            return res.sendStatus(400);
        }

        await connection.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
         VALUES ($1, $2, $3, $4, $5, $6, $7);`
        ,[customerId, gameId, today, daysRented, null, game.rows[0].pricePerDay*daysRented ,null ]);

        console.log(customerId, gameId, daysRented, today,);

        res.sendStatus(201);
    }catch(err){
        console.log(err)
        res.sendStatus(500);
    }
});

server.post("/rentals/:id/return", async (req, res) =>{
    const {id} = req.params;    
    const today = dayjs().format('YYYY-MM-DD');


    try{
        const rental = await connection.query(`SELECT * FROM rentals WHERE id = $1;`,[id])
        if(rental.rows.length===0){
            return res.sendStatus(404);
        }
        if(rental.rows[0].returnDate !== null){
            return res.sendStatus(400);
        }
        let day = rental.rows[0].rentDate;
        const diferenceDays = dayjs(today).diff(dayjs(JSON.stringify(day).slice(1, 11)), 'day');
        const delay = diferenceDays - rental.rows[0].daysRented;
        const delayFee = null

        if(delay > 0){
        const game = await connection.query('SELECT * FROM games WHERE id = $1;',[rental.rows[0].gameId]);
        const price = game.rows[0].pricePerDay;
        delayFee = delay*price;
        }

        await connection.query(`UPDATE rentals SET "returnDate" = $1, "delayFee"= $2 
            WHERE id = $3;
        `, [today, delayFee, id]);
        
        res.sendStatus(200);
    }catch(err){
        console.log(err)
        res.sendStatus(500);
    }
});

server.delete("/rentals/:id", async (req, res) =>{
    const {id} = req.params;   

    try{
        const rental = await connection.query(`SELECT * FROM rentals WHERE id = $1;`,[id])
        if(rental.rows.length===0){
            return res.sendStatus(404);
        }
        if(rental.rows[0].returnDate === null){
            return res.sendStatus(400);
        }

        await connection.query(`DELETE FROM rentals WHERE id = $1`, [id]);
        
        res.sendStatus(200);
    }catch(err){
        console.log(err)
        res.sendStatus(500);
    }
});


server.listen(process.env.PORT, ()=>{
    console.log(`Listening on the port ${process.env.PORT}`)
});

