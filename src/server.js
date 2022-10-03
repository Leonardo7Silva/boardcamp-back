import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import categoryRouter from "./routers/categoryRouter.js";
import gameRouter from "./routers/gameRouters.js";
import customerRouter from "./routers/customerRouters.js";
import rentalsRouter from "./routers/rentalsRouters.js"

dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());
server.use(categoryRouter);
server.use(gameRouter);
server.use(customerRouter);
server.use(rentalsRouter);


server.listen(process.env.PORT, ()=>{
    console.log(`Listening on the port ${process.env.PORT}`)
});