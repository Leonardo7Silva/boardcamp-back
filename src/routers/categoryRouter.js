import express from "express";
import { categoryList, addCategory } from "../controllers/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.get("/categories", categoryList);
categoryRouter.post("/categories", addCategory);

export default categoryRouter;
