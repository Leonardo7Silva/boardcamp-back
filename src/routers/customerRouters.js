import express  from "express";
import { customerList, customerFilteredList, addCustomer, updateCustomer } from "../controllers/customersController.js";

const customerRouter = express.Router();

customerRouter.get("/customers", customerList);
customerRouter.get("/customers/:id", customerFilteredList);
customerRouter.post("/customers", addCustomer);
customerRouter.put("/customers/:id", updateCustomer);

export default customerRouter;