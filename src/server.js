import express from "express";
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const server = express();

const {Pool} = pg;

const conection = new Pool({
    connectionString: process.env.DATABASE_URL,
});

server.listen(process.env.PORT, ()=>{
    console.log(`Listening on the port ${process.env.PORT}`)
})

