import express  from "express";
import { rentalsList, newRental, returnGame, deleteRental } from "../controllers/rentalsController.js";

const rentalsRouter = express.Router();

rentalsRouter.get("/rentals", rentalsList);
rentalsRouter.post("/rentals", newRental);
rentalsRouter.post("/rentals/:id/return", returnGame);
rentalsRouter.delete("/rentals/:id",deleteRental);

export default rentalsRouter;
