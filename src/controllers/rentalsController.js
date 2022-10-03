import connection from "../conection/conection.js";
import dayjs from 'dayjs';

async function rentalsList(req, res){
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
            WHERE "customerId" = $1;`, [customerId]);
            base = customersFilter.rows;
        };

        if(gameId){
            const gamesFilter = await connection.query(`SELECT * FROM rentals 
            WHERE "gameId" = $1;`, [gameId]);
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
        console.log(gameId)
        res.sendStatus(500);
    }
};

async function newRental(req, res){
    const {customerId, gameId, daysRented} = req.body;
    if(daysRented <= 0){
        res.sendStatus(400)
    }
    const today = dayjs().format('YYYY-MM-DD');


    try{
        console.log("aqui1")
        const customer = await connection.query('SELECT * FROM customers WHERE id = $1;',[customerId]);
        if(customer.rows.length === 0 ){
            return res.sendStatus(400);
        }
        console.log("aqui2")
        const game = await connection.query('SELECT * FROM games WHERE id = $1;',[gameId]);
        if(game.rows.length === 0 ){
            return res.sendStatus(400);
        }
        console.log("aqui3")
        const qtdGamesRented = await connection.query('SELECT * FROM rentals WHERE "gameId" = $1;',[gameId]);

        const qtd = qtdGamesRented.rows.filter(value => value.returnDate === null);

        if(game.rows[0].stockTotal < qtd.length){
            return res.sendStatus(400);
        }
        console.log("aqui4")
        await connection.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
         VALUES ($1, $2, $3, $4, $5, $6, $7);`
        ,[customerId, gameId, today, daysRented, null, game.rows[0].pricePerDay*daysRented ,null ]);
        console.log("aqui5")
        res.sendStatus(201);
    }catch(err){
        res.sendStatus(500);
    }
};

async function returnGame(req, res){
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
        res.sendStatus(500);
    }
};

async function deleteRental(req, res){
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
        res.sendStatus(500);
    }
};

export {rentalsList, newRental, returnGame, deleteRental};