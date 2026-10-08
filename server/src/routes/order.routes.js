import { Router } from "express";
import { finalizeOrder } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post("/finalize", finalizeOrder);

export default orderRouter;
