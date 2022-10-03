import connection from "../conection/conection.js";
import { gameSchema } from "../schemas/schemas.js";


async function gameList(req, res){
    const name = req.query.name
    
    try{
        if(name){
            const gamesFiltrados = await connection.query(`SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id 
            WHERE games.name LIKE $1||'%' ;`, [name]);
            return res.send(gamesFiltrados.rows);
        };
        const games = await connection.query(
            'SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id ;'
            );
        res.send(games.rows);
    }catch(err){
        res.sendStatus(500);
    }
};

async function addGame(req, res){
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
        if(thereCategory.rows.length == 0 ){
            return res.sendStatus(400);
        };

        await connection.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay")
         VALUES ($1, $2, $3, $4, $5);`
        ,[name, image, stockTotal, categoryId, pricePerDay]);
        res.sendStatus(201);
    }catch(err){
        res.sendStatus(500);
    }
}

export {gameList, addGame};