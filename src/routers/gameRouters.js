import express  from "express";
import { gameList, addGame } from "../controllers/gameController.js";

const gameRouter = express.Router();

gameRouter.get("/games", gameList);
gameRouter.post("/games", addGame);

export default gameRouter;